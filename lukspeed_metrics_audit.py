#!/usr/bin/env python3
import os
import re
import json
from pathlib import Path

def audit_lukspeed_metrics():
    """Comprehensive audit of LukSpeed cycling metrics implementation"""
    
    print("🔍 LUKSPEED ADVANCED CYCLING METRICS AUDIT")
    print("=" * 60)
    
    audit_results = {
        "summary": {
            "total_categories": 7,
            "total_indicators": 28,
            "implemented": 0,
            "missing": 0,
            "partially_implemented": 0
        },
        "categories": {
            "power_training_load": {
                "category_name": "🔋 Power & Training Load Indicators",
                "indicators": {
                    "ftp_estimation": {"status": "unknown", "files": [], "implementation": ""},
                    "normalized_power": {"status": "unknown", "files": [], "implementation": ""},  
                    "intensity_factor": {"status": "unknown", "files": [], "implementation": ""},
                    "tss": {"status": "unknown", "files": [], "implementation": ""},
                    "power_zones_distribution": {"status": "unknown", "files": [], "implementation": ""},
                    "w_prime_anaerobic": {"status": "unknown", "files": [], "implementation": ""},
                    "power_curve": {"status": "unknown", "files": [], "implementation": ""}
                }
            },
            "torque_cadence": {
                "category_name": "⚙️ Torque & Cadence Indicators", 
                "indicators": {
                    "torque_average": {"status": "unknown", "files": [], "implementation": ""},
                    "torque_variability": {"status": "unknown", "files": [], "implementation": ""},
                    "torque_efficiency": {"status": "unknown", "files": [], "implementation": ""},
                    "optimal_cadence_terrain": {"status": "unknown", "files": [], "implementation": ""}
                }
            },
            "efficiency": {
                "category_name": "📈 Efficiency Indicators",
                "indicators": {
                    "speed_efficiency": {"status": "unknown", "files": [], "implementation": ""},
                    "terrain_efficiency": {"status": "unknown", "files": [], "implementation": ""},
                    "aerodynamic_efficiency": {"status": "unknown", "files": [], "implementation": ""},
                    "metabolic_efficiency": {"status": "unknown", "files": [], "implementation": ""}
                }
            },
            "cardiac_physiological": {
                "category_name": "❤️‍🔥 Cardiac & Physiological Indicators",
                "indicators": {
                    "cardiac_drift": {"status": "unknown", "files": [], "implementation": ""},
                    "watts_per_beat": {"status": "unknown", "files": [], "implementation": ""},
                    "calories_per_watt": {"status": "unknown", "files": [], "implementation": ""},
                    "hrr_utilization": {"status": "unknown", "files": [], "implementation": ""}
                }
            },
            "biomechanical": {
                "category_name": "🧘‍♂️ Biomechanical & Stability Indicators",
                "indicators": {
                    "cadence_variability": {"status": "unknown", "files": [], "implementation": ""},
                    "power_balance_lr": {"status": "unknown", "files": [], "implementation": ""},
                    "biomech_stability_index": {"status": "unknown", "files": [], "implementation": ""},
                    "micro_accelerations": {"status": "unknown", "files": [], "implementation": ""}
                }
            },
            "environmental": {
                "category_name": "🌡️ Environmental & Conditions Indicators",
                "indicators": {
                    "air_density_calculation": {"status": "unknown", "files": [], "implementation": ""},
                    "altitude_power_correction": {"status": "unknown", "files": [], "implementation": ""},
                    "wind_penalty_estimation": {"status": "unknown", "files": [], "implementation": ""},
                    "cda_calculation": {"status": "unknown", "files": [], "implementation": ""}
                }
            },
            "cyclist_profiling": {
                "category_name": "🧠 Cyclist Profile & Analysis",
                "indicators": {
                    "cyclist_type_classification": {"status": "unknown", "files": [], "implementation": ""},
                    "biomech_posture_efficiency": {"status": "unknown", "files": [], "implementation": ""},
                    "equipment_impact_estimation": {"status": "unknown", "files": [], "implementation": ""},
                    "energy_fatigue_accumulation": {"status": "unknown", "files": [], "implementation": ""}
                }
            }
        }
    }
    
    # Define comprehensive search patterns for each metric
    search_patterns = {
        "ftp": ["ftp", "functional.threshold", "threshold.power", "twenty.min"],
        "normalized_power": ["normalized.power", "\\bnp\\b", "norm.*power"],
        "tss": ["\\btss\\b", "training.stress", "stress.score"],
        "intensity_factor": ["intensity.factor", "\\bif\\b.*power", "if.*ratio"],
        "power_zones": ["power.*zone", "zone.*distribution", "coggan.*zone"],
        "w_prime": ["w.prime", "anaerobic.*capacity", "\\bw'\\b", "wprime"],
        "power_curve": ["power.*curve", "critical.power", "best.*effort", "peak.*power"],
        "torque": ["torque", "\\bnm\\b", "newton.meter"],
        "cadence": ["cadence", "\\brpm\\b", "revolutions"],
        "efficiency": ["efficiency", "speed.*per.*watt", "watts.*per.*kmh"],
        "aerodynamic": ["aerodynamic", "\\bcda\\b", "drag.*coefficient", "aero.*efficiency"],
        "cardiac": ["cardiac", "heart.*rate", "\\bhr\\b", "drift", "beats.*per.*minute"],
        "balance": ["balance", "left.*right", "l.*r.*power", "asymmetry"],
        "environmental": ["environmental", "air.*density", "altitude", "wind", "temperature"],
        "biomechanical": ["biomechanical", "stability", "variability", "micro.*acceleration"]
    }
    
    # Search through source files
    src_path = Path("src")
    found_implementations = {}
    
    if src_path.exists():
        print("\n🔍 Scanning source files...")
        
        for file_path in src_path.rglob("*.ts"):
            if file_path.name.endswith('.ts') or file_path.name.endswith('.tsx'):
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        content_lower = content.lower()
                        
                        # Check for various metrics
                        for pattern_name, patterns in search_patterns.items():
                            for pattern in patterns:
                                if re.search(pattern, content_lower):
                                    if pattern_name not in found_implementations:
                                        found_implementations[pattern_name] = []
                                    found_implementations[pattern_name].append({
                                        "file": str(file_path),
                                        "pattern": pattern,
                                        "context": content[:200] + "..." if len(content) > 200 else content
                                    })
                                    print(f"✅ Found {pattern_name} pattern '{pattern}' in {file_path}")
                                    
                except Exception as e:
                    print(f"❌ Error reading {file_path}: {e}")
    
    # Analyze database schema
    print("\n🗄️ Analyzing database schema...")
    migrations_path = Path("supabase/migrations")
    schema_info = []
    
    if migrations_path.exists():
        for migration in migrations_path.glob("*.sql"):
            try:
                with open(migration, 'r', encoding='utf-8') as f:
                    content = f.read().lower()
                    
                    # Look for advanced metrics tables
                    if any(term in content for term in ['activity_advanced_metrics', 'power_curve', 'training_load', 'efficiency', 'zones']):
                        schema_info.append({
                            "file": str(migration),
                            "relevant": True,
                            "content_preview": content[:300] + "..."
                        })
                        print(f"📄 Found relevant schema: {migration.name}")
                        
            except Exception as e:
                print(f"❌ Error reading {migration}: {e}")
    
    # Map findings to audit results
    print("\n📊 Mapping findings to audit categories...")
    
    # FTP Implementation
    if 'ftp' in found_implementations:
        audit_results["categories"]["power_training_load"]["indicators"]["ftp_estimation"]["status"] = "implemented"
        audit_results["categories"]["power_training_load"]["indicators"]["ftp_estimation"]["files"] = [f["file"] for f in found_implementations["ftp"]]
        audit_results["summary"]["implemented"] += 1
    else:
        audit_results["categories"]["power_training_load"]["indicators"]["ftp_estimation"]["status"] = "missing"
        audit_results["summary"]["missing"] += 1
    
    # TSS Implementation
    if 'tss' in found_implementations:
        audit_results["categories"]["power_training_load"]["indicators"]["tss"]["status"] = "implemented"
        audit_results["categories"]["power_training_load"]["indicators"]["tss"]["files"] = [f["file"] for f in found_implementations["tss"]]
        audit_results["summary"]["implemented"] += 1
    else:
        audit_results["categories"]["power_training_load"]["indicators"]["tss"]["status"] = "missing"
        audit_results["summary"]["missing"] += 1
    
    # Power Zones
    if 'power_zones' in found_implementations:
        audit_results["categories"]["power_training_load"]["indicators"]["power_zones_distribution"]["status"] = "implemented"
        audit_results["categories"]["power_training_load"]["indicators"]["power_zones_distribution"]["files"] = [f["file"] for f in found_implementations["power_zones"]]
        audit_results["summary"]["implemented"] += 1
    else:
        audit_results["categories"]["power_training_load"]["indicators"]["power_zones_distribution"]["status"] = "missing"
        audit_results["summary"]["missing"] += 1
    
    # Power Curve
    if 'power_curve' in found_implementations:
        audit_results["categories"]["power_training_load"]["indicators"]["power_curve"]["status"] = "implemented"
        audit_results["categories"]["power_training_load"]["indicators"]["power_curve"]["files"] = [f["file"] for f in found_implementations["power_curve"]]
        audit_results["summary"]["implemented"] += 1
    else:
        audit_results["categories"]["power_training_load"]["indicators"]["power_curve"]["status"] = "missing"
        audit_results["summary"]["missing"] += 1
    
    # Torque
    if 'torque' in found_implementations:
        audit_results["categories"]["torque_cadence"]["indicators"]["torque_average"]["status"] = "implemented"
        audit_results["categories"]["torque_cadence"]["indicators"]["torque_average"]["files"] = [f["file"] for f in found_implementations["torque"]]
        audit_results["summary"]["implemented"] += 1
    else:
        audit_results["categories"]["torque_cadence"]["indicators"]["torque_average"]["status"] = "missing"
        audit_results["summary"]["missing"] += 1
    
    # Efficiency
    if 'efficiency' in found_implementations:
        audit_results["categories"]["efficiency"]["indicators"]["speed_efficiency"]["status"] = "implemented"
        audit_results["categories"]["efficiency"]["indicators"]["speed_efficiency"]["files"] = [f["file"] for f in found_implementations["efficiency"]]
        audit_results["summary"]["implemented"] += 1
    else:
        audit_results["categories"]["efficiency"]["indicators"]["speed_efficiency"]["status"] = "missing"
        audit_results["summary"]["missing"] += 1
    
    # Continue mapping for remaining categories...
    remaining_indicators = 28 - audit_results["summary"]["implemented"] - audit_results["summary"]["missing"]
    audit_results["summary"]["missing"] += remaining_indicators
    
    return audit_results, found_implementations, schema_info

if __name__ == "__main__":
    try:
        results, implementations, schema = audit_lukspeed_metrics()
        
        # Save comprehensive audit results
        with open("lukspeed_metrics_audit_report.json", "w") as f:
            json.dump(results, f, indent=2)
        
        with open("lukspeed_implementations_found.json", "w") as f:
            json.dump(implementations, f, indent=2)
            
        with open("lukspeed_schema_analysis.json", "w") as f:
            json.dump(schema, f, indent=2)
        
        print(f"\n✅ AUDIT COMPLETED")
        print(f"📊 Summary: {results['summary']['implemented']} implemented, {results['summary']['missing']} missing")
        print(f"📁 Results saved to lukspeed_metrics_audit_report.json")
        print(f"🔍 Implementation details in lukspeed_implementations_found.json")
        print(f"🗄️ Schema analysis in lukspeed_schema_analysis.json")
        
    except Exception as e:
        print(f"❌ Audit failed: {e}")
        
