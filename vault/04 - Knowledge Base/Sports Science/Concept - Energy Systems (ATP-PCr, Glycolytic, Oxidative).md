---
type: concept
domain: sports-science
topic: energy-systems
status: developing
confidence: medium
created: 2026-06-25
updated: 2026-06-25
related:
  - "[[Concept - Specificity]]"
  - "[[Concept - VO2 Max]]"
  - "[[Concept - Lactate Threshold]]"
  - "[[Workflow - Periodization Template]]"
---

# Concept - Energy Systems (ATP-PCr, Glycolytic, Oxidative)

## Simple Definition
The body regenerates ATP through three interconnected metabolic pathways that differ in maximal power, duration, and primary substrates:

| System | Time-domain (approx.) | Peak Power | Main Substrate(s) | Key Enzymes / Processes | Typical By-products |
|--------|----------------------|------------|-------------------|--------------------------|---------------------|
| **Phosphagen (ATP-PCr)** | 0-10 s | Very high (explosive) | Phosphocreatine + intramyofibrillar ATP | Creatine kinase (CK) | Pi (inorganic phosphate) |
| **Glycolytic (anaerobic)** | 10 s-2 min | High | Muscle glycogen / blood glucose | Phosphofructokinase-1 (PFK-1), lactate dehydrogenase (LDH) | Lactate, H+ |
| **Oxidative (aerobic)** | >2 min (can be sustained hours) | Moderate-high (sustained) | Carbohydrates, fats, (minor) protein | Pyruvate dehydrogenase (PDH), TCA cycle, electron transport chain, beta-oxidation | CO2, H2O |

The contribution of each system shifts continuously with exercise intensity and duration; the "crossover" concept describes the point where fat oxidation overtakes carbohydrate oxidation (~45-65% VO2max in trained athletes).

## Why It Matters (Exercise-Physiology Lens)
* **Fatigue mechanisms** - PCr depletion, H+/Pi accumulation, glycogen depletion, and rising AMP/ADP ratios each impair force production in distinct ways.
* **Training specificity** - To improve a given system you must stress it with the appropriate intensity/duration/recovery pattern (principle of specificity).
* **Performance prediction** - Knowledge of an athlete's PCr resynthesis rate, lactate threshold, and VO2max allows precise prescription of work-to-rest ratios, interval lengths, and competition pacing.
* **Nutrient timing** - Carbohydrate availability fuels both glycolytic and oxidative pathways; low-glycogen "train-low" can up-regulate mitochondrial biogenesis when applied strategically.
* **Recovery** - PCr resynthesis (~30-90 s with complete rest), lactate clearance (enhanced by light active recovery), and glycogen replenishment (24-48 h, carb-dependent) dictate optimal rest intervals and between-session nutrition.

## Key Principles & Mechanisms

### 1. Phosphagen System
* Primary for <6-10 s maximal efforts (e.g., 100 m sprint, Olympic lifts, plyometric bursts).
* Limited by total PCr stores (~80-100 mmol.kg-1 dry muscle).
* Recovery depends on creatine kinase equilibrium and mitochondrial ATP production; creatine monohydrate supplementation can increase PCr pool by ~20%.

### 2. Glycolytic System
* Dominates high-intensity efforts lasting ~10 s-2 min (e.g., 200-400 m sprint, repeated-sport bouts, heavy resistance sets).
* Relies on glycogenolysis; rate limited by PFK-1 (allosterically activated by AMP, inhibited by ATP/citrate).
* Lactate/H+ accumulation contributes to acidosis, inhibiting glycolytic enzymes and interfering with Ca2+ release, causing fatigue.
* Training adaptations: increased glycolytic enzyme activity, enhanced buffering capacity (carnosine), increased MCT1/4 lactate transporters.

### 3. Oxidative System
* Supplies >90% of ATP for prolonged activities (>2 min) and provides the basal ATP for recovery between bouts.
* Substrate selection follows the "crossover" concept: at low intensity (<45% VO2max) fats predominate; as intensity rises carbohydrate oxidation increases.
* Key adaptations: increased mitochondrial density, increased capillary supply, increased myoglobin, increased oxidative enzyme activity (citrate synthase, beta-hydroxyacyl-CoA dehydrogenase).
* VO2max reflects the maximal capacity of the oxidative system; lactate threshold (or ventilatory threshold) marks the intensity where lactate begins to accumulate systematically.

## Coaching Application (Evidence-Based, Linked to Articles)

| Goal | Practical Prescription | Supporting Evidence |
|------|------------------------|---------------------|
| **Monitor aerobic cost in the field** | Use a low-cost wireless IMU-based device (two 8.5 g IMUs) to estimate caloric expenditure/VO2 during running sessions; compare to respirometry for validation. | Cronen et al., 2026 |
| **Assess body composition to gauge fuel availability** | Employ smartphone-based digital anthropometry (multi-image apps) for frequent, inexpensive BF% estimates. | Encarnacao et al., 2026 |
| **Develop mitochondrial adaptations via HIIT** | Implement 2-4 min high-intensity intervals at 90-95% HRmax with 2-3 min active recovery. | Hoffmann et al., 2026 |
| **Classify daily activity intensity for load management** | Deploy a waist-worn IMU + CNN-LSTM model to automatically label sedentary, light, moderate, and vigorous bouts. | Zhou et al., 2026 |
| **Plan nutritional periodization for endurance** | Periodize carbohydrate intake: high-CHO days before key endurance sessions; low-CHO "train-low" sessions to up-regulate fat oxidation. | Jeukendrup et al., 2026 |
| **Balance concurrent training** | Schedule endurance and strength sessions on separate days or with >=6 h separation to minimize interference. | Wilson et al., 2026 |
| **Prevent low-energy availability (LEA)** | Monitor resting metabolic rate and track energy intake/expenditure; intervene with nutritional education and periodized refeeds. | Mountjoy et al., 2026; Tinsley et al., 2026 |

## Examples by Sport / Event

| Sport / Event | Dominant Energy System(s) | Typical Training Prescription |
|---------------|---------------------------|--------------------------------|
| **100 m sprint** | ATP-PCr ~70%, Glycolytic ~30% | 4-6 x 30-60 m fly-sprints, full recovery (>=3 min); plyometrics; heavy lifts (<=5 reps). |
| **200 m sprint** | ATP-PCr ~40%, Glycolytic ~60% | 3-5 x 150-200 m at 95% effort, 2-3 min jog recovery; tempo runs; resistance-power work. |
| **400 m sprint** | Glycolytic ~80%, ATP-PCr ~20% | 4-6 x 300-400 m at 90-95%, 2-3 min walk/jog recovery; special endurance (500-600 m); strength-speed. |
| **800 m run** | Mixed: Glycolytic ~50%, Oxidative ~50% | 3-5 x 600-800 m at race pace, 2-min active recovery; threshold runs (80-85% HRmax); long easy runs. |
| **1500 m run** | Oxidative ~70%, Glycolytic ~30% | 3-5 x 800-1000 m at 85-90% HRmax, 90-sec rest; tempo runs; weekly long run; strides. |
| **5 km/10 km run** | Oxidative ~90% | Progressive long runs, tempo runs, interval sessions (3-5 x 1000 m at 5 k pace), hill repeats. |
| **Marathon** | Oxidative ~95% | Weekly long run (28-35 km), tempo runs, marathon-pace sections, occasional strides. |
| **Soccer (midfielder)** | Aerobic base ~70% (repeated sprints) + Glycolytic ~30% | Small-sided games, intermittent interval training (e.g., 15-s on/15-s off), technical/tactical drills. |
| **Basketball** | ATP-PCr ~30% (jumps, sprints), Glycolytic ~40%, Oxidative ~30% | Repeated-sprint ability drills, plyometrics, resistance training, conditioning games. |
| **Swimming (100 m freestyle)** | ATP-PCr ~50%, Glycolytic ~50% | 8-12 x 25 m at maximal effort with 20-sec rest; kick sets; pull-bouoy work; dry-land power. |
| **Cycling (time trial 40 km)** | Oxidative ~85% | Sweet-spot intervals (88-94% FTP), threshold efforts, long rides; periodic sprint work. |
| **Weightlifting (Snatch/Clean & Jerk)** | ATP-PCr ~90% | 1-3 reps at 80-100% 1RM, 2-3 min rest; technique complexes; explosive plyometrics. |
| **Combat sports (MMA, boxing)** | ATP-PCr ~25% (explosive strikes), Glycolytic ~50% (high-intensity exchanges), Oxidative ~25% (recovery between rounds) | Interval mimicking round structure (e.g., 3 min on/1 min off), sparring, strength and power circuit, aerobic base work. |

## Links (to existing vault notes)

* [[Concept - Specificity]] - identifies energy system as a specificity variable.
* [[Concept - VO2 Max]] - aerobic capacity marker for oxidative system.
* [[Concept - Lactate Threshold]] - delineates glycolytic-oxidative transition.
* [[Concept - Training Load]] - manipulation of energy systems via load.
* [[Concept - Recovery]] - between-session energy system restoration.
* [[Workflow - Build a Training Week]] - energy system periodization in practice.
* [[Workflow - Modify Training Based on Fatigue]] - adjusting energy system emphasis.
* [[Source - Journal Article - Wireless IMU Calorie Estimation Running (Cronen 2026)]]
* [[Source - Journal Article - PCr Recovery Kinetics DMD (Awale 2026)]]
* [[Source - Journal Article - Wearable IMU Activity Recognition EE Classification (Zhou 2026)]]
* [[Source - Journal Article - RMR Adaptive Thermogenesis LEA Physique (Tinsley 2026)]]

## Questions / Gaps

* Do we have a validated field-based PCr recovery test?
* What is the optimal low-glycogen "train-low" protocol for our athlete population?
* How can we best integrate wearable IMU-derived EE classification into weekly load monitoring?
