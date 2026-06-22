# AnswerRank 🏆

**AI Citation Scoring for the Answer Era**

---

## 🚀 About The Project

Welcome to **AnswerRank**, a 2026 Hackathon Pitch project built by Team One Wish Willow (Aryan Chaurasia & Harshit Agrawal).

**The Problem:** We identified the "₹2 Crore Blindspot". Brands spend massive budgets on influencer campaigns that generate millions of Instagram views, but when high-intent buyers ask AI models like ChatGPT, Gemini, or Perplexity for recommendations, those creators get **zero** citations.

**The Solution:** SEO is dead; Generative Engine Optimization (GEO) is the future. AnswerRank is the first deterministic engine built to measure AI citation visibility. We provide a real-time "AnswerRank Score" for creators and enterprise brands to evaluate how effectively content will be cited by Large Language Models. Our goal is to become the *de facto standard* for influencer vetting in the Answer Era—exactly what Domain Authority was for SEO.

---

## ✨ Key Features

* **Instant AI Diagnosis:** Creators paste a content URL and receive a sub-2-second AnswerRank Score.


* **Itemized Feedback:** The system highlights missing factors like "Missing FAQs," "Weak Entities," and "Low Authority".


* **Optimize with Gemini:** A one-click rewrite feature that optimizes the structure, entities, and FAQs without losing the creator's authentic voice.


* **Brand Campaign Matching:** Enterprise discovery dashboards to track "Share of Voice" and match campaigns with verified creators.



---

## 🛠 Tech Stack Architecture

Our hallucination-proof scoring pipeline is built in two distinct layers:

### Layer 1: Deterministic Engine (Zero Hallucinations)

* **Trafilatura:** Strips clean text from YouTube URLs, blogs, and PDFs, removing fluff and leaving only the core signal.


* **Python + FastAPI:** The core scoring engine that runs without calling an LLM.


* **7 Heuristics:** Evaluates content based on Direct Answers, Entity Clarity, FAQ, Data, Authority, Format, and Freshness.



### Layer 2: Semantic Layer

* **SentenceTransformers:** Compares text against Indian niche vectors using cosine similarity.


* **React Dashboards:** Powers the real-time Authority Graph and Campaign Match features.


* **Gemini API:** Called *only* for the "Optimize for AI" feature to rewrite content safely.



Note: The pitch deck UI itself is built using HTML, CSS (Scroll-Snap), and Vanilla JavaScript.

---

## 💼 Business Model

AnswerRank operates as a B2B2C Freemium SaaS platform, where creators supply the data and brands generate the revenue:

* **Creator Free (₹0):** 3 audits/month. Acts as an acquisition funnel to build our verified database.


* **Creator Pro (₹499/mo):** Unlimited audits, weekly tracking, and automated 30-day AI visibility briefs.


* **Brand Enterprise (₹15K/mo):** Full access to the discovery dashboard, campaign matching, and Share of Voice metrics.



Targeting an India Total Addressable Market (TAM) of ₹2,200Cr.

---

## 👥 Team

* **Aryan Chaurasia**

* **Harshit Agrawal**

* *Team: One Wish Willow*
