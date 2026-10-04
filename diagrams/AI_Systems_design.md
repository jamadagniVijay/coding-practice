How do you evaluate a RAG system?
Do not evaluate only the final answer.

Separate the system:

Question
   ↓
Retrieval quality
   ↓
Context quality
   ↓
Generation quality
   ↓
Final answer
If the correct document was never retrieved, changing the prompt may accomplish very little.

A useful evaluation set should contain realistic questions with expected sources or answers. You can then track retrieval metrics alongside answer correctness, grounding, latency, and cost.

=================================
How would you design an LLM gateway?
If several applications call model providers directly, configuration quickly becomes fragmented.

An LLM gateway can centralize:


Applications
     ↓
LLM Gateway
 ├── Authentication
 ├── Rate limits
 ├── Model routing
 ├── Logging
 ├── Cost tracking
 ├── Retry policy
 └── Provider fallback
     ↓
Model Providers
The gateway should remain infrastructure rather than becoming a giant place for every application's business prompts.
==================================
How would you handle an LLM provider outage?
Depending on the product, you might combine bounded retries, exponential backoff, circuit breaking, another model provider, degraded functionality, queues for asynchronous requests, or a clear temporary failure response.

Fallback also needs evaluation. Switching from one model to another is not useful if the second model produces output your application cannot safely consume.
==================================
How would you implement model routing?
Not every request needs the most capable and expensive model.

You might route:


Simple classification → smaller model
Summarization         → mid-tier model
Complex reasoning     → stronger model
Routing can consider task complexity, latency requirements, customer tier, context length, cost budget, or previous model performance.

The important part is measuring whether routing actually preserves quality.

Saving 60% on inference is not a success if task accuracy collapses.

==================================

How would you control LLM costs?
Start by understanding where tokens are being consumed.

A request may include:


System prompt      1,500 tokens
Conversation       4,000 tokens
Retrieved docs     8,000 tokens
User question        100 tokens
Output             1,500 tokens
Sending 13,600 input tokens for every question can become expensive at scale.

Useful optimizations include better retrieval, smaller context, prompt caching where supported, conversation summarization, model routing, output limits, and avoiding unnecessary repeated context.

Cost should be observable per feature, customer, model, and request type.

==================================


==================================

