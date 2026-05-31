# LeetCode: Subarray Sum Equals K to LLD and System Design

This document bridges the gap between the abstract algorithmic problem **"Subarray Sum Equals K" (LeetCode 560)** and practical software engineering, mapping it directly to Low-Level Design (LLD) and High-Level System Design (HLD) using Python.

---

## 🚀 1. The Core Algorithm (Python)

The optimal solution handles both positive and negative integers in \(O(N)\) time complexity using a **Prefix Sum Hash Map**.

```python
def subarray_sum(nums: list[int], k: int) -> int:
    """
    Finds the total number of subarrays that sum up to k.
    Time Complexity: O(N)
    Space Complexity: O(N)
    """
    count = 0
    current_sum = 0
    # Stores the frequency of prefix sums encountered so far
    prefix_sums = {0: 1} 
    
    for num in nums:
        current_sum += num
        
        # Check if a matching prefix sum exists
        if (current_sum - k) in prefix_sums:
            count += prefix_sums[current_sum - k]
        
        # Update the frequency of the current prefix sum
        prefix_sums[current_sum] = prefix_sums.get(current_sum, 0) + 1
        
    return count
```

---

## 🏗️ 2. Low-Level Design (LLD) Mapping

In production-ready code, raw algorithmic code is wrapped inside clean, maintainable, and decoupled object-oriented structures.

### Real-World Use Case: Financial Ledger Auditing
An accounting application needs to scan a sequence of transactions to flag sequences of entries that perfectly sum up to a specific target amount (e.g., matching a reported fraudulent amount or a missing balance).

### Applied Design Pattern: Strategy Pattern
We implement the **Strategy Pattern** to let the system switch between different subarray evaluation algorithms at runtime based on the data profile (e.g., using a memory-optimized Sliding Window if all numbers are positive vs. a Hash Map strategy if numbers include negatives).

```python
from abc import ABC, abstractmethod
from typing import List

# ==========================================
# 1. Strategy Interface
# ==========================================
class SubarrayMatchingStrategy(ABC):
    @abstractmethod
    def find_matches(self, data: List[int], target: int) -> int:
        """Execute the specific subarray search algorithm."""
        pass

# ==========================================
# 2. Concrete Strategy A (Handles Negatives)
# ==========================================
class PrefixSumHashMapStrategy(SubarrayMatchingStrategy):
    def find_matches(self, data: List[int], target: int) -> int:
        count, current_sum = 0, 0
        prefix_sums = {0: 1}
        for num in data:
            current_sum += num
            if (current_sum - target) in prefix_sums:
                count += prefix_sums[current_sum - target]
            prefix_sums[current_sum] = prefix_sums.get(current_sum, 0) + 1
        return count

# ==========================================
# 3. Concrete Strategy B (Positive Numbers Only)
# ==========================================
class SlidingWindowStrategy(SubarrayMatchingStrategy):
    def find_matches(self, data: List[int], target: int) -> int:
        # Optimized O(1) space sliding window for unsigned/positive stream data
        count, current_sum, start = 0, 0, 0
        for end in range(len(data)):
            current_sum += data[end]
            while current_sum > target and start <= end:
                current_sum -= data[start]
                start += 1
            if current_sum == target:
                count += 1
        return count

# ==========================================
# 4. Context Class (The Business Service)
# ==========================================
class TransactionAuditService:
    def __init__(self, strategy: SubarrayMatchingStrategy):
        self._strategy = strategy

    def set_strategy(self, strategy: SubarrayMatchingStrategy):
        """Allows dynamic switching of the algorithm at runtime."""
        self._strategy = strategy

    def audit_ledger(self, ledger_entries: List[int], target_amount: int) -> int:
        # Decouples the orchestrator from the algorithmic implementation
        if not ledger_entries:
            return 0
        return self._strategy.find_matches(ledger_entries, target_amount)

# ==========================================
# Client Usage Example
# ==========================================
if __name__ == "__main__":
    ledger = [10, -5, 15, 5, -10, 20]
    target_fraud_signature = 20
    
    # Initialize with the Hash Map strategy to safely handle negative values
    audit_tool = TransactionAuditService(PrefixSumHashMapStrategy())
    flagged_patterns = audit_tool.audit_ledger(ledger, target_fraud_signature)
    
    print(f"Audit completed. Flagged occurrences: {flagged_patterns}")
```

---

## 🌐 3. High-Level System Design (HLD) Mapping

When moving to System Design, the data array scales beyond local RAM into an infinite, high-velocity, distributed stream.

### Real-World Use Case: IoT Grid Anomaly Detection
Thousands of smart industrial factory sensors continuously emit power consumption metrics. The system must raise an alert if a consecutive sequence of power spikes matches a hazardous threshold profile (summing up to exactly \(K\)).

### Distributed Scale Challenges & Architectural Solutions

*   **Distributed Stream Ingestion**: The array cannot reside on one machine. Use **Apache Kafka** or **AWS Kinesis** partitioned by a routing key (e.g., `sensor_id`). This ensures all contiguous data points from the same source flow to the exact same consumer node.
*   **Stateful Processing**: The `prefix_sums` dictionary can no longer just sit in local memory; otherwise, a server crash loses all context. Use a stateful stream processing engine like **Apache Flink (PyFlink)** or **Spark Streaming**, backing up intermediate states to an in-memory database like **Redis**.
*   **Time-Window Boundaries**: Infinite streams require bounds. Implement **sliding windows** or **tumbling windows** via the streaming engine to limit the search size (e.g., check metrics within 10-minute blocks).

### Data Flow Pipeline
```text
[IoT Sensors] 
      │
      ▼ (Emits metrics payload: {sensor_id, value, timestamp})
[Apache Kafka] (Partitioned by sensor_id)
      │
      ▼ (Consumed by stream cluster)
[PyFlink Workers] <─── Sync/Async Fetch ───> [Redis Cluster] (Maintains persistent 
      │                                                     prefix_sums per sensor_id)
      ▼ (If Target Sum K is met)
[Alerts Microservice] ───> [PagerDuty / Dashboard]
```

---

## 🎯 Architectural Summary Matrix


| Metric / Dimension | LeetCode Context | Low-Level Design (LLD) | High-Level System Design (HLD) |
| :--- | :--- | :--- | :--- |
| **Data Structure** | `List[int]` | Domain Models / Collections | Distributed Stream Partitions |
| **State Storage** | Local variable (`dict`) | Private instance property | In-Memory Distributed Store (**Redis**) |
| **Primary Focus** | Big-O time/space efficiency | SOLID principles & maintainability | High availability, low latency, fault tolerance |
| **Data Constraints** | Finite, fully static boundaries | Limited to single process lifecycle | Infinite, continuous, and asynchronous |
