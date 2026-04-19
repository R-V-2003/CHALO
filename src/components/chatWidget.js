// AI Smart Navigation Chat Widget — Floating FAB + slide-up chat panel
import { api } from '../api.js';
import { storage } from '../utils/storage.js';

let chatContainer = null;
let messagesArea = null;
let chatInput = null;
let isOpen = false;
let messages = []; // { text, isUser }

const SUGGESTIONS = [
  '🗺️ What routes are available?',
  '🚐 Gurukul to Thaltej?',
  '📍 Stops near Vastrapur',
  '💰 What are the fares?'
];

function getWelcomeMessage() {
  const user = storage.get('user');
  const name = user?.name ? ` ${user.name.split(' ')[0]}` : '';
  return `Hi${name}! 👋 I'm Bhaya — your smart navigation assistant!\n\nTell me where you want to go, and I'll find the best shuttle route for you. Try:\n• "How to go from Paldi to Thaltej?"\n• "I want to reach Vastrapur"\n• "Nearest stop to IIM"`;
}

function createMessageBubble(text, isUser) {
  const bubble = document.createElement('div');
  bubble.className = `chat-msg ${isUser ? 'chat-msg-user' : 'chat-msg-bot'}`;

  if (!isUser) {
    // Check if this is a navigation response with steps
    const rendered = renderRichMessage(text);
    bubble.innerHTML = rendered;
  } else {
    bubble.textContent = text;
  }

  return bubble;
}

function renderRichMessage(text) {
  // Detect if the message has numbered steps (navigation plan)
  const hasSteps = /\d+\.\s*(Walk|Board|Alight|Take|Get)/i.test(text);
  const hasOptions = /Option\s*\d|option\s*\d/i.test(text);
  
  if (hasSteps || hasOptions) {
    return renderNavigationCard(text);
  }
  
  // Detect nearest stops response
  const hasNearestStops = /nearest stop/i.test(text) && /\d+\.\s/.test(text) && /km away/i.test(text);
  if (hasNearestStops) {
    return renderNearestStopsCard(text);
  }

  // Regular message — apply basic formatting
  return formatBasicMessage(text);
}

function formatBasicMessage(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
    .replace(/(₹\d+)/g, '<strong class="nav-fare-inline">$1</strong>');
}

function renderNavigationCard(text) {
  let html = '';
  
  // Split into options if multi-option response
  const optionSplit = text.split(/(?=Option\s*\d)/i);
  
  if (optionSplit.length > 1) {
    // Multi-option: intro text + option cards
    const intro = optionSplit[0].trim();
    if (intro) {
      html += `<div class="nav-intro">${formatBasicMessage(intro)}</div>`;
    }
    
    optionSplit.slice(1).forEach((optBlock, idx) => {
      html += renderSinglePlanCard(optBlock.trim(), idx);
    });

    // Check for recommendation text at the end
    const lastBlock = optionSplit[optionSplit.length - 1];
    const recMatch = lastBlock.match(/(I'd recommend|I recommend|I would recommend|Which one).*/is);
    if (recMatch) {
      const recText = recMatch[0].replace(/\n/g, ' ').trim();
      html += `<div class="nav-recommendation">${formatBasicMessage(recText)}</div>`;
    }
  } else {
    // Single plan
    html += renderSinglePlanCard(text, 0);
  }
  
  return html;
}

function renderSinglePlanCard(block, optionIndex) {
  let html = '';
  
  // Extract option title
  const titleMatch = block.match(/^(Option\s*\d[^:]*:?)/i);
  const optionTitle = titleMatch ? titleMatch[1].replace(/:$/, '') : null;

  // Extract total fare and walking distance from summary lines
  const fareMatch = block.match(/Total fare:?\s*(₹\d+)/i);
  const walkMatch = block.match(/Total walk(?:ing)?:?\s*([\d.]+\s*km)/i);
  const totalFare = fareMatch ? fareMatch[1] : null;
  const totalWalk = walkMatch ? walkMatch[1] : null;

  // Extract numbered steps
  const stepRegex = /(\d+)\.\s*(.+?)(?=\n\d+\.|Total fare|Total walk|$)/gs;
  const steps = [];
  let match;
  
  // Clean the block for step extraction 
  const cleanBlock = block.replace(/^Option\s*\d[^:]*:?\s*/i, '').trim();
  while ((match = stepRegex.exec(cleanBlock)) !== null) {
    steps.push({ num: match[1], text: match[2].trim() });
  }

  // Build the card
  const colors = ['#22A147', '#4285F4', '#FF9800', '#9C27B0'];
  const accent = colors[optionIndex % colors.length];

  html += `<div class="nav-card" style="--nav-accent: ${accent}">`;
  
  // Card header
  if (optionTitle || totalFare) {
    html += `<div class="nav-card-header">`;
    if (optionTitle) {
      html += `<div class="nav-card-title">${optionTitle}</div>`;
    }
    if (totalFare || totalWalk) {
      html += `<div class="nav-card-badges">`;
      if (totalFare) html += `<span class="nav-badge nav-badge-fare">💰 ${totalFare}</span>`;
      if (totalWalk) html += `<span class="nav-badge nav-badge-walk">🚶 ${totalWalk}</span>`;
      html += `</div>`;
    }
    html += `</div>`;
  }

  // Steps timeline
  if (steps.length > 0) {
    html += `<div class="nav-steps">`;
    steps.forEach((step, i) => {
      const stepType = getStepType(step.text);
      const isLast = i === steps.length - 1;
      
      html += `<div class="nav-step ${isLast ? 'nav-step-last' : ''}">`;
      html += `  <div class="nav-step-line">`;
      html += `    <div class="nav-step-dot nav-step-dot-${stepType}">`;
      html += `      ${getStepIcon(stepType)}`;
      html += `    </div>`;
      if (!isLast) html += `<div class="nav-step-connector"></div>`;
      html += `  </div>`;
      html += `  <div class="nav-step-content">`;
      html += `    <div class="nav-step-label">${getStepLabel(stepType)}</div>`;
      html += `    <div class="nav-step-text">${formatStepText(step.text)}</div>`;
      html += `  </div>`;
      html += `</div>`;
    });
    html += `</div>`;

    // Add "Chalo chalte hai" button if we have steps and a discovered route
    let routeName = '';
    steps.forEach(s => {
      const type = getStepType(s.text);
      if (type === 'board') {
        // AI format: Board 🚐 "Gujarat University to Thaltej" shuttle
        const match = s.text.match(/"([^"]+)"\s*shuttle/i);
        if (match) routeName = match[1];
      }
    });

    if (routeName) {
      // Escape for safety
      const safeRoute = routeName.replace(/"/g, '&quot;');
      const safeWalk = totalWalk ? totalWalk.replace(/"/g, '&quot;') : '';
      const safeFare = totalFare ? totalFare.replace(/"/g, '&quot;') : '';
      
      html += `<button class="btn-start-nav" data-route="${safeRoute}" data-walk="${safeWalk}" data-fare="${safeFare}">Chalo chalte hai 🚀</button>`;
    }

  } else {
    // No steps parsed — fallback to formatted text
    html += `<div class="nav-card-body">${formatBasicMessage(cleanBlock)}</div>`;
  }

  html += `</div>`;
  return html;
}

function getStepType(text) {
  const lower = text.toLowerCase();
  if (lower.includes('walk') || lower.includes('🚶')) return 'walk';
  if (lower.includes('board') || lower.includes('take the') || lower.includes('🚐')) return 'board';
  if (lower.includes('alight') || lower.includes('get down') || lower.includes('get off')) return 'alight';
  return 'general';
}

function getStepIcon(type) {
  switch(type) {
    case 'walk': return '🚶';
    case 'board': return '🚐';
    case 'alight': return '📍';
    default: return '➤';
  }
}

function getStepLabel(type) {
  switch(type) {
    case 'walk': return 'Walk';
    case 'board': return 'Board Shuttle';
    case 'alight': return 'Alight';
    default: return 'Step';
  }
}

function formatStepText(text) {
  // First: bold quoted text BEFORE injecting any HTML with class attributes
  let result = text.replace(/"([^"]+)"/g, '<strong>"$1"</strong>');
  // Then: inject styled tags
  result = result
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(Fare:\s*₹\d+)/gi, '<span class="nav-fare-tag">$1</span>')
    .replace(/(₹\d+)/g, '<strong class="nav-fare-inline">$1</strong>')
    .replace(/(\d+\.?\d*\s*km)/gi, '<span class="nav-dist">$1</span>')
    .replace(/(~\d+\s*min)/gi, '<span class="nav-time">$1</span>');
  return result;
}

function renderNearestStopsCard(text) {
  let html = '';
  
  // Split into intro and stop list
  const lines = text.split('\n');
  const introLines = [];
  const stopEntries = [];
  const footerLines = [];
  let parsingStops = false;
  let pastStops = false;

  for (const line of lines) {
    const stopMatch = line.match(/^(\d+)\.\s*(.+)/);
    if (stopMatch && !pastStops) {
      parsingStops = true;
      stopEntries.push({ num: stopMatch[1], text: stopMatch[2].trim() });
    } else if (parsingStops && !stopMatch) {
      pastStops = true;
      if (line.trim()) footerLines.push(line.trim());
    } else {
      if (line.trim()) introLines.push(line.trim());
    }
  }

  if (introLines.length) {
    html += `<div class="nav-intro">${formatBasicMessage(introLines.join('\n'))}</div>`;
  }

  if (stopEntries.length) {
    html += `<div class="nav-card" style="--nav-accent: #4285F4">`;
    html += `<div class="nav-card-header"><div class="nav-card-title">📍 Nearby Stops</div></div>`;
    html += `<div class="nav-stops-list">`;
    stopEntries.forEach(stop => {
      const distMatch = stop.text.match(/([\d.]+\s*km\s*away)/i);
      const timeMatch = stop.text.match(/(~\d+\s*min\s*walk)/i);
      html += `<div class="nav-stop-item">`;
      html += `  <div class="nav-stop-rank">#${stop.num}</div>`;
      html += `  <div class="nav-stop-info">`;
      html += `    <div class="nav-stop-name">${formatStepText(stop.text.split('—')[0].trim())}</div>`;
      if (distMatch || timeMatch) {
        html += `<div class="nav-stop-meta">`;
        if (distMatch) html += `<span class="nav-dist">${distMatch[1]}</span>`;
        if (timeMatch) html += `<span class="nav-time">${timeMatch[1]}</span>`;
        html += `</div>`;
      }
      html += `  </div>`;
      html += `</div>`;
    });
    html += `</div></div>`;
  }

  if (footerLines.length) {
    html += `<div class="nav-footer-text">${formatBasicMessage(footerLines.join('\n'))}</div>`;
  }

  return html;
}

function createTypingIndicator() {
  const bubble = document.createElement('div');
  bubble.className = 'chat-msg chat-msg-bot chat-typing';
  bubble.innerHTML = '<span></span><span></span><span></span>';
  return bubble;
}

function scrollToBottom() {
  if (messagesArea) {
    requestAnimationFrame(() => {
      messagesArea.scrollTop = messagesArea.scrollHeight;
    });
  }
}

function attachNavButtonListeners() {
  const buttons = document.querySelectorAll('.btn-start-nav');
  buttons.forEach(btn => {
    if (btn.hasAttribute('data-attached')) return;
    btn.setAttribute('data-attached', 'true');
    
    btn.addEventListener('click', () => {
      const route = btn.getAttribute('data-route');
      const walk = btn.getAttribute('data-walk');
      const fare = btn.getAttribute('data-fare');
      
      window.dispatchEvent(new CustomEvent('chalo-start-nav', {
        detail: { route, walk, fare }
      }));
      
      const closeBtn = document.querySelector('.chat-close-btn');
      if (closeBtn) closeBtn.click();
    });
  });
}

function addMessage(text, isUser) {
  messages.push({ text, isUser });
  if (messagesArea) {
    const typing = messagesArea.querySelector('.chat-typing');
    if (typing) typing.remove();
    messagesArea.appendChild(createMessageBubble(text, isUser));
    scrollToBottom();
    attachNavButtonListeners();
  }
}

async function sendMessage(text) {
  if (!text.trim()) return;

  addMessage(text, true);
  if (chatInput) chatInput.value = '';

  // Hide suggestion chips after first message
  const suggestionsArea = chatContainer?.querySelector('.chat-suggestions');
  if (suggestionsArea) suggestionsArea.style.display = 'none';

  const typing = createTypingIndicator();
  messagesArea.appendChild(typing);
  scrollToBottom();

  try {
    // Check if user is logged in before sending
    const token = storage.get('auth_token');
    if (!token) {
      addMessage('🔒 Please log in first to use Bhaya! Go to your profile and sign in.', false);
      return;
    }

    // Send conversation history for context
    const historyToSend = messages.slice(-8).map(m => ({ text: m.text, isUser: m.isUser }));
    const data = await api.chat(text.trim(), historyToSend);
    addMessage(data.reply, false);
  } catch (err) {
    console.error('Chat error:', err);
    if (err.message && (err.message.includes('Access denied') || err.message.includes('Invalid token'))) {
      addMessage('🔒 Your session has expired. Please log in again to continue chatting.', false);
    } else {
      addMessage('Sorry, something went wrong. Please try again.', false);
    }
  }
}

function buildChatPanel() {
  const panel = document.createElement('div');
  panel.className = 'chat-panel';
  panel.innerHTML = `
    <div class="chat-header">
      <div class="chat-header-info">
        <div class="chat-header-avatar">
          <img src="/icons/dp.jpg" alt="Bhaya Avatar" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <div>
          <div class="chat-header-title">Bhaya</div>
          <div class="chat-header-subtitle">🧭 Smart Navigation</div>
        </div>
      </div>
      <button class="chat-close-btn" aria-label="Close chat">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
    </div>
    <div class="chat-messages"></div>
    <div class="chat-suggestions"></div>
    <div class="chat-input-area">
      <input type="text" class="chat-input" placeholder="Where do you want to go?" autocomplete="off" />
      <button class="chat-send-btn" aria-label="Send message">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>
    </div>
  `;

  messagesArea = panel.querySelector('.chat-messages');
  chatInput = panel.querySelector('.chat-input');
  const suggestionsArea = panel.querySelector('.chat-suggestions');
  const sendBtn = panel.querySelector('.chat-send-btn');
  const closeBtn = panel.querySelector('.chat-close-btn');

  // Welcome message
  messagesArea.appendChild(createMessageBubble(getWelcomeMessage(), false));

  // Suggestion chips
  SUGGESTIONS.forEach(q => {
    const chip = document.createElement('button');
    chip.className = 'chat-suggestion-chip';
    chip.textContent = q;
    chip.addEventListener('click', () => {
      suggestionsArea.style.display = 'none';
      sendMessage(q);
    });
    suggestionsArea.appendChild(chip);
  });

  sendBtn.addEventListener('click', () => sendMessage(chatInput.value));
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage(chatInput.value);
  });
  closeBtn.addEventListener('click', () => closeChat());

  return panel;
}

function updateChatVisibility() {
  if (!chatContainer) return;
  const token = storage.get('auth_token');
  if (token) {
    chatContainer.style.display = '';
  } else {
    chatContainer.style.display = 'none';
    // Close panel if open
    if (isOpen) closeChat();
  }
}

export function createChatWidget() {
  if (chatContainer) return chatContainer;

  chatContainer = document.createElement('div');
  chatContainer.className = 'chat-widget';
  chatContainer.id = 'chat-widget';

  // Only show when logged in
  const token = storage.get('auth_token');
  if (!token) chatContainer.style.display = 'none';

  // Listen for login/logout changes
  window.addEventListener('storage', updateChatVisibility);
  // Custom event for same-tab login/logout
  window.addEventListener('chalo-auth-change', updateChatVisibility);

  // Floating Action Button
  const fab = document.createElement('button');
  fab.className = 'chat-fab';
  fab.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  `;
  fab.title = 'Chat with Bhaya';

  const chatPanel = buildChatPanel();

  fab.addEventListener('click', () => {
    if (!isOpen) openChat(); else closeChat();
  });

  chatContainer.appendChild(fab);
  chatContainer.appendChild(chatPanel);
  document.body.appendChild(chatContainer);

  return chatContainer;
}

export function openChat() {
  isOpen = true;
  const fab = chatContainer?.querySelector('.chat-fab');
  const panel = chatContainer?.querySelector('.chat-panel');
  if (fab) fab.classList.add('hidden');
  if (panel) {
    panel.classList.add('open');
    setTimeout(() => chatInput?.focus(), 300);
  }
}

export function closeChat() {
  isOpen = false;
  const fab = chatContainer?.querySelector('.chat-fab');
  const panel = chatContainer?.querySelector('.chat-panel');
  if (fab) fab.classList.remove('hidden');
  if (panel) panel.classList.remove('open');
}
