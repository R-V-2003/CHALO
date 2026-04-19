# Sustainable Cloud Computing & AI Energy Optimization

## A Case Study on the CHALO Ride-Hailing Platform

---

**Course:** Sustainable Energy in Computing

**Academic Year:** 2025–2026

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Cloud Cost Calculation](#2-cloud-cost-calculation)
3. [Sustainable Tokens for AI](#3-sustainable-tokens-for-ai)
4. [Comparison of Cloud Cost Software](#4-comparison-of-cloud-cost-software)
5. [Real-Life Examples](#5-real-life-examples)
6. [Conclusion](#6-conclusion)
7. [References](#7-references)

---

## 1. Introduction

As cloud computing adoption accelerates globally, the environmental impact of data centers and cloud infrastructure has become a critical concern. The International Energy Agency (IEA) estimates that data centers account for **1–1.5% of global electricity consumption**, and this figure is projected to grow with the rise of AI workloads.

This report examines the sustainability dimensions of cloud computing through three lenses:

1. **Cloud Cost Calculation** — analyzing the financial cost of running applications on cloud platforms as a proxy for resource consumption
2. **Sustainable AI Tokens** — studying how AI systems consume energy and proposing optimization methods
3. **Cloud Platform Comparison** — evaluating AWS, Azure, and GCP on pricing, scalability, and sustainability

We use the **CHALO** shared auto-rickshaw ride-hailing platform as a real-life case study. CHALO is a full-stack web application deployed on AWS ECS Fargate (ap-south-1, Mumbai), serving routes, driver information, and real-time shuttle tracking to users in Ahmedabad, India.

---

## 2. Cloud Cost Calculation

### 2.1 Methodology

Cloud cost is calculated based on three primary components: **compute**, **storage**, and **data transfer**. We analyze the CHALO application's monthly running costs on AWS ECS Fargate.

**Application Profile:**

| Parameter | Value |
|-----------|-------|
| Platform | Node.js + Express (REST API) |
| Frontend | Static SPA (Vite build) served by Express |
| Database | SQLite (file-based, in-container) |
| Container | Single Fargate task |
| CPU | 0.25 vCPU |
| Memory | 512 MB |
| Region | ap-south-1 (Mumbai) |
| Uptime | 24/7 (continuous) |

### 2.2 Compute Cost

| Resource | Configuration | Monthly Hours | Rate (ap-south-1) | Monthly Cost |
|----------|--------------|---------------|-------------------|--------------|
| vCPU | 0.25 vCPU | 730 hrs | $0.04048/vCPU-hr | $7.39 |
| Memory | 512 MB (0.5 GB) | 730 hrs | $0.004445/GB-hr | $1.62 |
| **Compute Total** | | | | **$9.01** |

### 2.3 Storage Cost

| Resource | Usage | Rate | Monthly Cost |
|----------|-------|------|--------------|
| Container Image (ECR) | ~150 MB | $0.10/GB | $0.02 |
| CloudWatch Logs | ~500 MB/month | $0.50/GB | $0.25 |
| SQLite Database | ~2 MB (in-container) | Included in compute | $0.00 |
| **Storage Total** | | | **$0.27** |

### 2.4 Data Transfer Cost

| Type | Estimated Monthly | Rate | Monthly Cost |
|------|-------------------|------|--------------|
| Inbound Data Transfer | 100 MB | Free | $0.00 |
| Outbound Data Transfer (to internet) | 5 GB | $0.09/GB (first 10 TB) | $0.45 |
| Inter-AZ Data Transfer | Negligible | — | $0.00 |
| **Data Transfer Total** | | | **$0.45** |

### 2.5 Total Monthly Cost Summary

| Component | Monthly Cost | % of Total |
|-----------|-------------|------------|
| Compute | $9.01 | 92.4% |
| Storage | $0.27 | 2.8% |
| Data Transfer | $0.45 | 4.6% |
| **Total** | **$9.73** | **100%** |

### 2.6 Annual Cost Projection

| Period | Cost |
|--------|------|
| Monthly | $9.73 |
| Quarterly | $29.19 |
| Annually | $116.76 |

### 2.7 Cost vs. Energy Relationship

Higher cloud costs directly correlate with greater energy consumption. The following table estimates energy usage based on AWS's published power usage effectiveness (PUE) for the Mumbai region:

| Metric | Value |
|--------|-------|
| Server power (0.25 vCPU + 512 MB) | ~15W estimated |
| Monthly energy consumption | ~10.95 kWh |
| AWS Mumbai PUE | ~1.2 |
| Total facility energy | ~13.14 kWh/month |
| CO₂ emission (India grid: 0.72 kg/kWh) | ~9.46 kg CO₂/month |

---

## 3. Sustainable Tokens for AI

### 3.1 How AI Systems Consume Energy

AI systems, particularly large language models (LLMs), consume significant energy at every stage of their lifecycle:

| Stage | Energy Consumer | Estimated Power |
|-------|----------------|-----------------|
| **Training** | GPU clusters (A100/H100) running for weeks/months | 200–1,000 MWh per model |
| **Inference** | Processing user queries in real-time | 0.5–4 Wh per query |
| **Data Storage** | Storing training datasets and model weights | 1–10 MW per data center |
| **Network Transfer** | Sending requests/responses | 0.1–0.5 Wh per request |

### 3.2 Token-Level Energy Consumption

In LLMs, text is processed as "tokens" (word fragments). Each token processed during inference requires computational operations on GPU/TPU hardware.

| Model | Parameters | Energy per 1,000 Tokens | CO₂ per 1,000 Tokens |
|-------|-----------|------------------------|----------------------|
| GPT-4 | ~1.8T (est.) | ~4.0 Wh | ~2.88 g CO₂ |
| GPT-3.5 | ~175B | ~0.8 Wh | ~0.58 g CO₂ |
| Claude Sonnet | (Undisclosed) | ~1.5 Wh (est.) | ~1.08 g CO₂ |
| Llama 2 (7B) | 7B | ~0.15 Wh | ~0.11 g CO₂ |
| BERT Base | 110M | ~0.02 Wh | ~0.01 g CO₂ |

*Estimates based on published research (Luccioni et al., 2023) and AWS India grid carbon intensity.*

### 3.3 Token Optimization Strategies

#### Strategy 1: Prompt Engineering

Efficient prompts reduce token usage, directly lowering energy consumption.

| Approach | Tokens Used | Energy Saved |
|----------|------------|--------------|
| Verbose prompt (100 tokens) | 100 input + 500 output = 600 | Baseline |
| Optimized prompt (30 tokens) | 30 input + 300 output = 330 | **45% reduction** |

**Example (CHALO project):**

```
❌ Inefficient (85 tokens):
"Can you please tell me what are all the shared auto rickshaw routes that are
currently available in the city of Ahmedabad that I can take to go from Gujarat
University to Thaltej area? I would also like to know the fare and the driver
details if possible. Thank you so much for your help."

✅ Optimized (20 tokens):
"List routes from Gujarat University to Thaltej with fare and driver info."
```

#### Strategy 2: Model Selection

Choosing the right model size for the task prevents unnecessary energy usage.

| Task | Overkill Model | Right-Sized Model | Energy Savings |
|------|---------------|-------------------|----------------|
| Text classification | GPT-4 (4.0 Wh) | BERT (0.02 Wh) | **99.5%** |
| Simple Q&A | GPT-4 (4.0 Wh) | GPT-3.5 (0.8 Wh) | **80%** |
| Code generation | GPT-3.5 (0.8 Wh) | Claude Haiku (0.3 Wh) | **62.5%** |
| Complex reasoning | GPT-3.5 (0.8 Wh) | GPT-4 (4.0 Wh) | Appropriate — no savings |

#### Strategy 3: Caching and Batching

| Technique | Description | Energy Impact |
|-----------|-------------|---------------|
| **Response Caching** | Store frequent query results | 90–100% savings on cached queries |
| **Batch Processing** | Group multiple requests | 30–50% savings per request |
| **Token Limiting** | Cap max output tokens | 20–40% savings |
| **Compression** | Use shorter system prompts | 10–25% savings |

### 3.4 Sustainable AI Framework

```
┌─────────────────────────────────────────────────────┐
│              SUSTAINABLE AI PYRAMID                   │
│                                                       │
│                    ╱╲                                 │
│                   ╱  ╲                                │
│                  ╱    ╲   Green Energy                │
│                 ╱  4.  ╲  (Renewable Sources)         │
│                ╱────────╲                             │
│               ╱          ╲                            │
│              ╱   Carbon   ╲   Carbon Offsetting       │
│             ╱    3.        ╲  (Compensation)           │
│            ╱────────────────╲                         │
│           ╱                  ╲                        │
│          ╱   Efficient Infra  ╲  Hardware Optim.      │
│         ╱      2.              ╲ (GPU Sharing, etc.)   │
│        ╱────────────────────────╲                     │
│       ╱                          ╲                    │
│      ╱    Token & Model Opt.      ╲   Software Layer  │
│     ╱         1.                    ╲  (Right-sizing)  │
│    ╱──────────────────────────────────╲               │
│                                                        │
│   START HERE → Biggest impact at the base             │
└─────────────────────────────────────────────────────┘
```

### 3.5 Case Study: AI Energy in the CHALO Project

CHALO itself does not use AI/ML directly, but if AI features were added (e.g., route optimization, demand prediction), the energy impact would be:

| Feature | Model Type | Estimated Monthly Tokens | Energy (kWh/month) |
|---------|-----------|-------------------------|---------------------|
| Route optimization (batch, daily) | Llama 2 7B | 50,000 | 0.008 |
| Demand prediction (hourly) | Linear regression | N/A (CPU only) | 0.05 |
| Chat support (user-facing) | GPT-3.5 | 500,000 | 0.4 |
| **Total AI overhead** | | | **0.458 kWh** |

This would increase the platform's total energy consumption from 13.14 kWh/month to **13.60 kWh/month** — a 3.5% increase.

---

## 4. Comparison of Cloud Cost Software

### 4.1 Platforms Compared

We compare three major cloud providers for hosting the CHALO application workload:

| Feature | AWS (Current) | Azure | Google Cloud |
|---------|--------------|-------|-------------|
| **Service** | ECS Fargate | Container Instances | Cloud Run |
| **Region** | ap-south-1 (Mumbai) | Central India | Mumbai |
| **Container** | Docker (Linux) | Docker (Linux) | Docker (Linux) |

### 4.2 Pricing Comparison

#### Compute Pricing (0.25 vCPU, 512 MB, 730 hrs/month)

| Provider | Service | vCPU Rate | Memory Rate | Monthly Compute |
|----------|---------|-----------|-------------|----------------|
| **AWS** | ECS Fargate | $0.04048/hr | $0.004445/GB-hr | **$9.01** |
| **Azure** | Container Instances | $0.03520/hr | $0.003900/GB-hr | **$7.83** |
| **GCP** | Cloud Run | $0.00002400/vCPU-sec | $0.00000250/GiB-sec | **$6.31** |

*Note: GCP Cloud Run pricing assumes minimum 1 instance always-on. With scale-to-zero (pay-per-use), cost could drop to ~$2-3/month for low traffic.*

#### Storage Pricing

| Provider | Container Registry | Logs | Total Storage |
|----------|-------------------|------|--------------|
| **AWS** | ECR: $0.10/GB | CloudWatch: $0.50/GB | **$0.27** |
| **Azure** | ACR: $0.10/GB | Log Analytics: $0.50/GB | **$0.27** |
| **GCP** | Artifact Registry: $0.10/GB | Cloud Logging: $0.50/GB | **$0.27** |

#### Data Transfer Pricing

| Provider | Outbound Rate (first 10 TB) | 5 GB/month |
|----------|----------------------------|------------|
| **AWS** | $0.09/GB | **$0.45** |
| **Azure** | $0.087/GB | **$0.44** |
| **GCP** | $0.105/GB | **$0.53** |

### 4.3 Total Monthly Cost Comparison

| Component | AWS | Azure | GCP |
|-----------|-----|-------|-----|
| Compute | $9.01 | $7.83 | $6.31 |
| Storage | $0.27 | $0.27 | $0.27 |
| Data Transfer | $0.45 | $0.44 | $0.53 |
| **Total Monthly** | **$9.73** | **$8.54** | **$7.11** |
| **Annual** | **$116.76** | **$102.48** | **$85.32** |

### 4.4 Scalability Comparison

| Criterion | AWS ECS Fargate | Azure Container Instances | GCP Cloud Run |
|-----------|----------------|--------------------------|---------------|
| Auto-scaling | Yes (Service Auto Scaling) | Yes (KEDA) | Yes (built-in) |
| Scale-to-zero | No (min 1 task) | No (min 1 container) | **Yes** |
| Max instances | 1,000+ | 100–1,000 | 1,000+ |
| Cold start | ~30 sec | ~15 sec | ~5 sec |
| Load balancer | ALB/NLB ($16+/mo extra) | Application Gateway ($25+/mo extra) | **Built-in (free)** |
| Custom domain | Via ALB + Route 53 | Via App Gateway | **Built-in** |

### 4.5 Performance Comparison

| Metric | AWS ECS Fargate | Azure Container Instances | GCP Cloud Run |
|--------|----------------|--------------------------|---------------|
| CPU performance (0.25 vCPU) | Good | Good | Good |
| Network latency (India) | Low (Mumbai) | Low (Pune) | Low (Mumbai) |
| Deployment time | 2–3 min | 1–2 min | 30–60 sec |
| Container startup | 20–30 sec | 15–25 sec | 5–10 sec |
| Uptime SLA | 99.99% | 99.9% | 99.95% |

### 4.6 Sustainability Comparison

| Metric | AWS | Azure | GCP |
|--------|-----|-------|-----|
| Carbon-neutral year | 2025 (pledged) | **2030 (behind)** | **2007 (achieved)** |
| Renewable energy % | 90% (2024) | 85% (2024) | **100% (matched)** |
| Mumbai region PUE | ~1.2 | ~1.25 | **~1.1** |
| Carbon footprint tool | Customer Carbon Footprint | Emissions Impact Calculator | **Carbon Footprint (free)** |

### 4.7 Overall Score Matrix

| Criterion | Weight | AWS | Azure | GCP |
|-----------|--------|-----|-------|-----|
| Pricing (lower = better) | 30% | 7/10 | 8/10 | **9/10** |
| Scalability | 25% | 8/10 | 7/10 | **9/10** |
| Performance | 20% | 9/10 | 8/10 | 8/10 |
| Sustainability | 15% | 8/10 | 7/10 | **10/10** |
| Ease of use | 10% | 7/10 | 8/10 | **9/10** |
| **Weighted Score** | **100%** | **7.8/10** | **7.7/10** | **9.0/10** |

---

## 5. Real-Life Examples

### 5.1 Example 1: CHALO Platform (This Project)

CHALO is a ride-hailing PWA deployed on AWS ECS Fargate. Key sustainability observations:

- **Lightweight architecture**: 24 KB gzipped frontend + 16-endpoint REST API keeps compute requirements minimal
- **SQLite database**: File-based DB avoids the overhead and cost of a managed database service (RDS would add ~$15/month minimum)
- **Single container**: No horizontal scaling needed for current load, minimizing resource waste
- **Area for improvement**: The ECS task runs 24/7 even with zero traffic. Migrating to GCP Cloud Run with scale-to-zero could reduce costs by 30–50% and energy consumption proportionally

### 5.2 Example 2: Netflix on AWS

Netflix spends an estimated **$9.6 million/month** on AWS infrastructure. Their sustainability initiatives include:

- **Auto-scaling**: Scales from 10,000 to 100,000+ instances during peak hours
- **CDN optimization**: 80% of content served from edge caches, reducing origin server load
- **Encoding efficiency**: Per-title encoding optimizes bitrate per video, saving 20% bandwidth

### 5.3 Example 3: Google Search Energy Footprint

Google processes **8.5 billion searches/day** with an estimated energy cost of **0.3 Wh per search**:

- Annual energy for search alone: ~930 GWh
- Google offsets this with 100% renewable energy matching
- Continuous model optimization has reduced per-query energy by 50% since 2015

### 5.4 Example 4: ChatGPT Energy Impact

OpenAI's ChatGPT serves an estimated **100 million queries/day**:

- Energy per query: ~2.9 Wh (Luccioni et al., 2023)
- Daily energy consumption: ~290 MWh
- Annual CO₂ equivalent: ~76,000 tonnes (comparable to 16,000 cars)
- Optimization efforts: GPT-4o-mini uses ~60% less energy than GPT-4 for similar tasks

---

## 6. Conclusion

This report demonstrates that cloud computing costs serve as a meaningful proxy for environmental impact. For the CHALO platform:

1. **Cloud costs are dominated by compute (92.4%)**, making compute optimization the highest-leverage sustainability intervention. Choosing serverless or scale-to-zero architectures (like GCP Cloud Run) could reduce both cost and energy by up to 50%.

2. **AI token consumption has a measurable environmental cost**. Each 1,000 tokens processed by a large model generates 0.5–4.0 Wh of energy consumption. Prompt optimization, model right-sizing, and caching can reduce this by 45–99%.

3. **GCP Cloud Run offers the best combination of cost, scalability, and sustainability** for lightweight container workloads like CHALO, scoring 9.0/10 overall compared to AWS (7.8) and Azure (7.7). Google's 100% renewable energy matching and lower PUE make it the most sustainable choice.

The key takeaway is that **architectural decisions directly impact sustainability**. Choosing SQLite over managed RDS, static SPA over SSR, and serverless over always-on compute are not just cost optimizations — they are energy optimizations that reduce the carbon footprint of software systems.

---

## 7. References

1. International Energy Agency. (2024). "Data Centres and Data Transmission Networks." *IEA Global Energy Review*.

2. Luccioni, S., Viguier, S., & Bengio, Y. (2023). "Estimating the Carbon Footprint of BLOOM, a 176B Parameter Language Model." *Journal of Machine Learning Research*.

3. Patterson, D., et al. (2022). "The Carbon Footprint of Machine Learning Training Will Plateau, Then Shrink." *Communications of the ACM*.

4. AWS Pricing. (2025). "Amazon ECS Pricing — Asia Pacific (Mumbai)." https://aws.amazon.com/ecs/pricing/

5. Google Cloud. (2025). "Cloud Run Pricing." https://cloud.google.com/run/pricing

6. Azure Pricing. (2025). "Container Instances Pricing." https://azure.microsoft.com/en-us/pricing/

7. Google. (2024). "Environmental Report — Carbon Neutral Since 2007." https://sustainability.google/

8. Microsoft. (2024). "Azure Sustainability — Carbon Negative by 2030." https://azure.microsoft.com/en-us/explore/global-infrastructure/sustainability/

9. Amazon. (2024). "The Climate Pledge — Net Zero Carbon by 2040." https://www.theclimatepledge.com/

10. Gupta, U., et al. (2023). "Chasing Carbon: The Elusive Environmental Footprint of Computing." *IEEE Micro*.

---

*Report generated for Sustainable Energy in Computing — April 2026*
