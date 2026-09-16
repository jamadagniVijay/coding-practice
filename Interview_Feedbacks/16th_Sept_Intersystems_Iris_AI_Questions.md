# Systems Integration Analyst – IRIS: Interview Prep

**Role:** Systems Integration Analyst – IRIS
**Candidate:** Vijay

> Anything in **[brackets]** needs a real example from your own work. Use only what you have actually done, because follow-up questions will probe it.

---

## Job Description Summary

**Must-have skills**
- InterSystems IRIS / IRIS for Health
- HealthShare
- Healthcare interoperability/integration experience
- HL7 (especially important)
- FHIR
- REST & SOAP APIs
- XML & JSON
- BPL (Business Process Language)
- Message routing, transformation and interface development
- Healthcare/EHR integration experience
- Integrating clinical applications, medical devices, laboratory analysers
- Production support, monitoring and troubleshooting
- Strong stakeholder/vendor management

**Ideal profile:** IRIS Developer / IRIS Integration Analyst / HealthShare Consultant / Healthcare Integration Engineer / HL7 Integration Specialist, with hands-on IRIS + HL7 + healthcare integration.

---

## Q1. Could you please introduce yourself and briefly describe your technical background?

"I'm Vijay, a senior software engineer at athenahealth with 10 years in my current role. I work on InterSystems IRIS and athenaIDX, which is built on Caché and ObjectScript, on the insurance card review and eligibility processing system. That work covers intake of card data, eligibility checks, auto-processing workflows, and handling no-response cases from payers. I'm also moving toward cloud-native healthcare: FHIR, SMART on FHIR, AWS HealthLake. I often act as the bridge between product, QA, and engineering on how the platform behaves. That's why an integration-focused IRIS role fits where I'm heading."

---

## Q2. Can you describe the architecture of IRIS and how it supports interoperability?

IRIS has three layers:

- **Data layer:** a multi-model database. Everything is stored in globals, and the same data can be accessed as objects, SQL tables, JSON documents, or key-value.
- **Namespaces and databases:** code and data are separated; package, global, and routine mappings let you share across namespaces.
- **Interoperability framework (the Production):**
  - *Business Services* receive data through inbound adapters (TCP/MLLP, HTTP, File, SOAP).
  - *Business Processes* route and orchestrate using BPL, routing rules, and DTL transformations.
  - *Business Operations* send data out through outbound adapters.

Every message is persisted, which gives the Message Viewer, Visual Trace, resend, and auditability — key for production support.

IRIS for Health adds native HL7 v2, FHIR (R4), CDA, and the SDA internal model, plus a built-in FHIR server. HealthShare builds on this for regional and enterprise records (e.g. Unified Care Record).

---

## Q3. What are globals in IRIS and how do they differ from traditional databases?

- A global is a persistent, sparse, sorted, multidimensional array, e.g. `^Patient(id,"Name")`, stored in a B-tree.
- No fixed schema. Subscripts are created on write; empty nodes take no space.
- Direct access via `$ORDER`, `$DATA`, `$GET` — very fast for hierarchical or key-based reads.
- **Tradeoff:** relational databases give schema enforcement, joins, and constraints out of the box. With raw globals you own integrity and indexing. IRIS bridges this: persistent classes store in globals but are also exposed as SQL tables. Use classes/SQL for most work and raw globals where performance or structure justifies it.

---

## Q4. How would you optimize a slow-running SQL query in IRIS?

1. **Look at the plan** with `EXPLAIN` or Show Plan in the Management Portal — index use vs full map scan.
2. **Refresh statistics** with `TUNE TABLE` for accurate selectivity and extent size. Often the biggest fix.
3. **Indexes:** standard indexes on filter/join columns; bitmap indexes for low-cardinality fields (e.g. status). Tradeoff: extra indexes slow inserts/updates.
4. **Rewrite the query:** avoid functions on indexed columns in WHERE, select only needed columns, check join order.
5. **Hints, only when needed:** `%PARALLEL`, `%NOINDEX`, `%FIRSTTABLE`. Frozen plans keep a good plan stable across upgrades.
6. **Measure before and after** with the SQL Statement Index and query performance stats. Success = measurably lower time or global-reference count on representative data volume.

---

## Q5. Write an ObjectScript function to parse a JSON string and store the data in a global.

```objectscript
ClassMethod SaveJSON(json As %String) As %Status
{
    set sc = $$$OK
    try {
        set obj = {}.%FromJSON(json)
        set id = $increment(^PatientData)
        set iter = obj.%GetIterator()
        while iter.%GetNext(.key, .value) {
            if $isobject(value) {
                set ^PatientData(id, key) = value.%ToJSON()   // nested object/array kept as JSON
            } else {
                set ^PatientData(id, key) = value
            }
        }
        set ^PatientData(id, "CreatedAt") = $zdatetime($horolog, 3)
    }
    catch ex {
        set sc = ex.AsStatus()
    }
    quit sc
}
```

**Talking points**
- `%FromJSON` throws on invalid JSON, so it sits inside the try block.
- `$increment` is atomic, so IDs are safe under concurrency.
- In production: validate required fields and consider recursing into nested objects instead of storing them as JSON strings.

---

## Q6. How would you handle an HL7 message in an IRIS environment?

1. **Inbound:** `EnsLib.HL7.Service.TCPService` (MLLP) or a File service, with a schema category (e.g. 2.5.1) or a custom schema for Z-segments.
2. **ACK:** configure ACK mode (immediate vs application) so the sender knows the message was received.
3. **Routing:** `EnsLib.HL7.MsgRouter.RoutingEngine` with rules on `MSH:9` (e.g. ADT^A01, ORU^R01), sending facility, etc.
4. **Transformation:** DTL maps fields, fixes date formats, translates codes via lookup tables.
5. **Outbound:** `EnsLib.HL7.Operation.TCPOperation` to the target system. `ReplyCodeActions` controls behavior on AE/AR (retry, suspend, alert).
6. **Validation and support:** message validation settings, Message Viewer and Visual Trace, resend suspended messages after a fix.
7. **FHIR path:** HL7 v2 → SDA3 → FHIR using built-in transforms, suitable for a FHIR repository such as HealthLake.

---

## Q7. Describe a scenario where you had to ensure data security within an IRIS system.

**Controls to cover**
- Role-based access with resources and roles, least privilege, SQL privileges.
- TLS configurations for all adapters and external endpoints.
- Database encryption at rest and journal encryption.
- Auditing for logins, PHI access, and configuration changes.
- OAuth2 / SMART on FHIR for API access.
- Masking PHI in logs and trace output.
- HIPAA minimum-necessary principle.

**Scenario structure:** "In the eligibility system we handle member IDs, subscriber details, and insurance card images, all of which are PHI. **[Your real example, e.g. restricting access, masking in logs, securing a payer interface]**. Result: **[outcome]**."

---

## Q8. How do you approach error handling in ObjectScript?

- **Modern approach:** `try/catch` with `%Exception` objects. `ex.AsStatus()` converts to `%Status`; `ex.Log()` writes to the application error log.
- **Status-based methods:** check with `$$$ISERR(sc)`, or use `$$$ThrowOnError(sc)` to convert a failed status into an exception.
- **Legacy code:** `$ZTRAP` and `$ETRAP`, common in older Caché/athenaIDX routines. Know them for maintenance; use try/catch in new code.
- **In productions:** return a proper `%Status` so the framework can retry, suspend, or alert. Configure `ReplyCodeActions`, retry intervals, failure timeouts, and alert management. Never swallow errors silently.

---

## Q9. Design a scalable IRIS-based system for a healthcare application and explain your choices.

- **Ingestion:** separate business services per channel (HL7 MLLP, FHIR REST, file/SFTP, device and lab feeds).
- **Processing:** routing engine, DTL, and BPL only where orchestration is needed. Canonical model: SDA or FHIR.
- **Scaling:**
  - Pool size on busy components, with FIFO kept where order matters (ADT). Tradeoff: parallelism vs ordering.
  - Mirroring for high availability and failover.
  - ECP application servers for horizontal compute scaling.
  - Sharding only for very large analytical data.
- **Data:** FHIR repository for API consumers; analytics offloaded to Redshift/HealthLake so the operational system isn't burdened.
- **Operations:** message purge schedules, monitoring and alerting, system default settings per environment.

---

## Q10. Discuss a time when you had to debug a complex issue in an IRIS application.

Use a STAR structure:

- **Situation:** **[e.g. eligibility auto-processing intermittently not completing / wrong status for no-response cases]**
- **Investigation:** reproduced with test data, traced globals and transactions, reviewed logs or Visual Trace, isolated the variable. **[specifics]**
- **Fix:** **[minimal change made]** and how it was verified against defined success criteria.
- **Prevention:** **[test added, monitoring, documentation]**

---

## Q11. Write a simple ObjectScript code snippet to handle exceptions during data processing.

```objectscript
ClassMethod ProcessRecords() As %Status
{
    set sc = $$$OK, errCount = 0
    set id = ""
    for {
        set id = $order(^InboundData(id))
        quit:id=""
        try {
            set name = $get(^InboundData(id, "Name"))
            if name = "" {
                $$$ThrowStatus($$$ERROR($$$GeneralError, "Missing Name for ID "_id))
            }
            set ^ProcessedData(id) = $zconvert(name, "U")
        }
        catch ex {
            set errCount = errCount + 1
            set ^ErrorLog(id) = ex.DisplayString()
            do ex.Log()
        }
    }
    if errCount > 0 {
        set sc = $$$ERROR($$$GeneralError, errCount_" record(s) failed")
    }
    quit sc
}
```

**Talking point:** one bad record doesn't stop the batch. Failures are logged for reprocessing, and the caller still gets a failed status.

---

## Q12. What strategies do you use for performance tuning in IRIS?

> The interviewer thanked you "for your honesty" here, which suggests this answer was thin. A fuller version:

- **Measure first:** `^SystemPerformance` for OS and IRIS metrics, `^PERFMON`, and `^%SYS.MONLBL` for line-by-line code profiling.
- **Memory:** size global and routine buffers so hot data stays cached.
- **Code:** reduce global references, use `$ORDER` loops efficiently, avoid repeated object opens in loops, batch writes.
- **SQL:** see Q4.
- **Productions:** pool sizes, queue depth monitoring, purging old messages, avoiding heavy BPL where a routing rule is enough.
- **Storage:** journal and database disk layout, watching database growth.

---

## Q13. How do you ensure your IRIS-based solutions are scalable and maintainable?

- **Code organization:** clear class packages and naming conventions; small single-purpose business hosts.
- **Configuration:** lookup tables and system default settings instead of hardcoded values, so the same code runs in dev, test, and prod.
- **Testing and delivery:** source control, `%UnitTest`, code review with a CI/CD path.
- **Operations:** documentation and runbooks for production support; monitoring with alerts that point to actionable causes.
- **Change discipline:** minimal-diff changes with defined success criteria before release.

---

## Q14. Do you have any final questions or additional input?

- "Which interfaces make up most of the volume: HL7 v2, FHIR, or device and lab feeds?"
- "Is this IRIS for Health standalone, or HealthShare components as well?"
- "What does production support look like: on-call rotation, SLAs, vendor escalation?"
- "What's the biggest integration challenge the team is facing right now?"

---

## Main Gap to Prepare For

The JD stresses hands-on HL7 interfaces, medical device or lab analyser integration, and vendor management. If direct experience there is limited, say so plainly and point to what transfers: deep IRIS/ObjectScript internals, payer eligibility integrations, and production troubleshooting. Then add what you're actively learning (productions, FHIR). That lands better than an answer that falls apart under follow-up questions.