#!/usr/bin/env python3
"""
🌐 LUKSPEED.COM DNS VERIFICATION
Verificación completa post-actualización GoDaddy
"""

import json
import socket
import subprocess
import time
from datetime import datetime
import sys

print("🌐 VERIFICACIÓN DNS LUKSPEED.COM - POST GODADDY UPDATE")
print("=" * 60)

def run_dig_command(domain, record_type="A", dns_server=None):
    """Ejecutar comando dig y parsear resultado"""
    try:
        cmd = ["dig", "+short"]
        if dns_server:
            cmd.append(f"@{dns_server}")
        cmd.extend([domain, record_type])
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            return result.stdout.strip().split('\n') if result.stdout.strip() else []
        else:
            return None
    except Exception as e:
        print(f"Error executing dig: {e}")
        return None

def check_basic_dns():
    """Verificación básica de records DNS"""
    print("\n🔍 PASO 1: VERIFICACIÓN DNS BÁSICA")
    print("-" * 40)
    
    domain = "lukspeed.com"
    www_domain = "www.lukspeed.com"
    
    dns_results = {
        "timestamp": datetime.now().isoformat(),
        "domain": domain,
        "dns_records": {},
        "recommendations": []
    }
    
    # 1. Verificar A Record para lukspeed.com
    print(f"🔍 Verificando A record para {domain}...")
    a_records = run_dig_command(domain, "A")
    
    if a_records and a_records != ['']:
        dns_results["dns_records"]["A_record"] = a_records
        print(f"✅ A Record encontrado: {a_records}")
        
        # Verificar si apunta a IPs típicos de hosting
        vercel_ips = ['76.76.19.61', '76.76.19.140', '76.76.19.207']
        netlify_ips = ['75.2.60.5', '99.83.190.102']
        
        is_vercel = any(ip in vercel_ips for ip in a_records)
        is_netlify = any(ip in netlify_ips for ip in a_records)
        
        if is_vercel:
            dns_results["dns_records"]["hosting_provider"] = "Vercel"
            dns_results["dns_records"]["vercel_configured"] = True
            print(f"✅ Configuración Vercel detectada")
        elif is_netlify:
            dns_results["dns_records"]["hosting_provider"] = "Netlify"
            dns_results["dns_records"]["netlify_configured"] = True
            print(f"✅ Configuración Netlify detectada")
        else:
            dns_results["dns_records"]["hosting_provider"] = "Other/Custom"
            dns_results["dns_records"]["vercel_configured"] = False
            print(f"⚠️ IPs no reconocidos como Vercel/Netlify: {a_records}")
            print(f"   Nota: Pueden ser válidos para otros proveedores")
    else:
        dns_results["dns_records"]["A_record"] = None
        print(f"❌ A Record no encontrado")
        dns_results["recommendations"].append("Configurar A record para lukspeed.com")
    
    # 2. Verificar CNAME Record para www.lukspeed.com
    print(f"\n🔍 Verificando CNAME record para {www_domain}...")
    cname_records = run_dig_command(www_domain, "CNAME")
    
    if cname_records and cname_records != ['']:
        dns_results["dns_records"]["CNAME_record"] = cname_records
        print(f"✅ CNAME Record encontrado: {cname_records}")
        
        # Verificar si apunta a servicios conocidos
        is_vercel_cname = any('vercel' in target.lower() for target in cname_records)
        is_netlify_cname = any('netlify' in target.lower() for target in cname_records)
        
        if is_vercel_cname:
            dns_results["dns_records"]["www_vercel_configured"] = True
            print(f"✅ CNAME Vercel configurado correctamente")
        elif is_netlify_cname:
            dns_results["dns_records"]["www_netlify_configured"] = True
            print(f"✅ CNAME Netlify configurado correctamente")
        else:
            dns_results["dns_records"]["www_vercel_configured"] = False
            print(f"⚠️ CNAME no apunta a servicios conocidos: {cname_records}")
    else:
        dns_results["dns_records"]["CNAME_record"] = None
        print(f"❌ CNAME Record no encontrado")
        dns_results["recommendations"].append("Configurar CNAME record para www.lukspeed.com")
    
    return dns_results

def check_global_propagation():
    """Verificar propagación desde múltiples DNS servers"""
    print("\n🌍 PASO 2: VERIFICACIÓN PROPAGACIÓN GLOBAL")
    print("-" * 40)
    
    dns_servers = {
        "Google Primary": "8.8.8.8",
        "Google Secondary": "8.8.4.4", 
        "Cloudflare": "1.1.1.1",
        "OpenDNS": "208.67.222.222",
        "Quad9": "9.9.9.9"
    }
    
    domain = "lukspeed.com"
    propagation_results = {}
    
    for location, dns_ip in dns_servers.items():
        print(f"🔍 Verificando desde {location} ({dns_ip})...")
        try:
            a_records = run_dig_command(domain, "A", dns_ip)
            
            if a_records and a_records != ['']:
                propagation_results[location] = {
                    "status": "SUCCESS",
                    "ips": a_records,
                    "dns_server": dns_ip
                }
                print(f"✅ {location}: {a_records}")
            else:
                propagation_results[location] = {
                    "status": "NO_RECORD",
                    "dns_server": dns_ip
                }
                print(f"❌ {location}: Sin record A")
                
        except Exception as e:
            propagation_results[location] = {
                "status": "ERROR",
                "error": str(e),
                "dns_server": dns_ip
            }
            print(f"❌ {location}: Error - {e}")
    
    # Calcular porcentaje de propagación
    successful_checks = len([r for r in propagation_results.values() if r["status"] == "SUCCESS"])
    total_checks = len(propagation_results)
    propagation_percentage = (successful_checks / total_checks) * 100
    
    print(f"\n📊 PROPAGACIÓN: {propagation_percentage:.1f}% ({successful_checks}/{total_checks})")
    
    return propagation_results, propagation_percentage

def check_connectivity():
    """Tests de conectividad básica usando sockets"""
    print("\n🔗 PASO 3: TESTS DE CONECTIVIDAD")
    print("-" * 30)
    
    connectivity_results = {}
    
    # Test básico de conexión HTTP (puerto 80)
    print("🔍 Verificando conectividad HTTP (puerto 80)...")
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        result = sock.connect_ex(('lukspeed.com', 80))
        sock.close()
        
        if result == 0:
            connectivity_results["http_port_80"] = {"status": "OPEN", "port": 80}
            print("✅ Puerto 80 (HTTP) está abierto")
        else:
            connectivity_results["http_port_80"] = {"status": "CLOSED", "port": 80}
            print("❌ Puerto 80 (HTTP) cerrado o no accesible")
    except Exception as e:
        connectivity_results["http_port_80"] = {"status": "ERROR", "error": str(e)}
        print(f"❌ Error verificando puerto 80: {e}")
    
    # Test básico de conexión HTTPS (puerto 443)
    print("\n🔍 Verificando conectividad HTTPS (puerto 443)...")
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        result = sock.connect_ex(('lukspeed.com', 443))
        sock.close()
        
        if result == 0:
            connectivity_results["https_port_443"] = {"status": "OPEN", "port": 443}
            print("✅ Puerto 443 (HTTPS) está abierto")
        else:
            connectivity_results["https_port_443"] = {"status": "CLOSED", "port": 443}
            print("❌ Puerto 443 (HTTPS) cerrado o no accesible")
    except Exception as e:
        connectivity_results["https_port_443"] = {"status": "ERROR", "error": str(e)}
        print(f"❌ Error verificando puerto 443: {e}")
    
    return connectivity_results

def check_ping_response():
    """Verificar respuesta a ping"""
    print("\n🏓 PASO 4: TEST DE PING")
    print("-" * 25)
    
    try:
        # Usar ping command del sistema
        result = subprocess.run(
            ["ping", "-c", "4", "lukspeed.com"], 
            capture_output=True, 
            text=True, 
            timeout=10
        )
        
        if result.returncode == 0:
            # Parsear estadísticas básicas
            lines = result.stdout.split('\n')
            stats_line = [line for line in lines if 'packets transmitted' in line]
            
            if stats_line:
                print("✅ Ping exitoso:")
                print(f"   {stats_line[0]}")
                return {"status": "SUCCESS", "details": stats_line[0]}
            else:
                print("✅ Ping exitoso (sin estadísticas parseables)")
                return {"status": "SUCCESS", "details": "Ping successful"}
        else:
            print("❌ Ping falló:")
            print(f"   {result.stderr}")
            return {"status": "FAILED", "error": result.stderr}
            
    except subprocess.TimeoutExpired:
        print("❌ Ping timeout (>10 segundos)")
        return {"status": "TIMEOUT"}
    except Exception as e:
        print(f"❌ Error ejecutando ping: {e}")
        return {"status": "ERROR", "error": str(e)}

def generate_comprehensive_report():
    """Generar reporte completo del estado"""
    print("\n📋 PASO 5: GENERANDO REPORTE COMPLETO")
    print("-" * 40)
    
    # Ejecutar todas las verificaciones
    dns_status = check_basic_dns()
    propagation_data, propagation_pct = check_global_propagation()
    connectivity_data = check_connectivity()
    ping_data = check_ping_response()
    
    # Crear reporte completo
    report = {
        "domain": "lukspeed.com",
        "verification_timestamp": datetime.now().isoformat(),
        "dns_records": dns_status["dns_records"],
        "propagation": {
            "percentage": propagation_pct,
            "details": propagation_data
        },
        "connectivity": connectivity_data,
        "ping": ping_data,
        "overall_status": "UNKNOWN",
        "recommendations": dns_status["recommendations"].copy()
    }
    
    # Determinar status general
    dns_configured = dns_status["dns_records"].get("A_record") is not None
    propagation_good = propagation_pct >= 70
    connectivity_good = (connectivity_data.get("http_port_80", {}).get("status") == "OPEN" or 
                        connectivity_data.get("https_port_443", {}).get("status") == "OPEN")
    ping_good = ping_data.get("status") == "SUCCESS"
    
    # Determinar estado general
    if dns_configured and propagation_good and (connectivity_good or ping_good):
        report["overall_status"] = "✅ READY FOR DEPLOYMENT"
        report["status_details"] = "Domain configured and accessible"
    elif dns_configured and propagation_pct >= 50:
        report["overall_status"] = "🔄 PROPAGATING - WAIT 1-24 HOURS"
        report["status_details"] = "DNS configured but still propagating"
    elif dns_configured and propagation_pct >= 20:
        report["overall_status"] = "⏳ DNS CONFIGURED - EARLY PROPAGATION"  
        report["status_details"] = "DNS records found but limited propagation"
    elif dns_configured:
        report["overall_status"] = "🔧 DNS CONFIGURED - PROPAGATION STARTING"
        report["status_details"] = "DNS records configured but not yet propagated"
    else:
        report["overall_status"] = "❌ DNS CONFIGURATION NEEDED"
        report["status_details"] = "No DNS records found"
    
    # Generar recomendaciones específicas
    if not dns_configured:
        report["recommendations"].append("Configure A record pointing to hosting provider IP")
    
    if propagation_pct < 70 and dns_configured:
        report["recommendations"].append("Wait for DNS propagation (normal: 1-24 hours)")
    
    if not connectivity_good and dns_configured and propagation_pct > 50:
        report["recommendations"].append("Check hosting provider configuration")
    
    if not ping_good and dns_configured:
        report["recommendations"].append("Verify server is responding to requests")
    
    return report

# EJECUTAR VERIFICACIÓN COMPLETA
try:
    final_report = generate_comprehensive_report()
    
    # Mostrar resumen final
    print(f"\n🎯 RESUMEN FINAL LUKSPEED.COM")
    print("=" * 35)
    print(f"Estado general: {final_report['overall_status']}")
    print(f"Detalles: {final_report['status_details']}")
    print(f"Propagación DNS: {final_report['propagation']['percentage']:.1f}%")
    
    # Mostrar detalles DNS
    if final_report['dns_records'].get('A_record'):
        print(f"A Record: {final_report['dns_records']['A_record']}")
    if final_report['dns_records'].get('CNAME_record'):
        print(f"CNAME Record: {final_report['dns_records']['CNAME_record']}")
    
    # Mostrar conectividad
    http_status = final_report['connectivity'].get('http_port_80', {}).get('status', 'UNKNOWN')
    https_status = final_report['connectivity'].get('https_port_443', {}).get('status', 'UNKNOWN')
    ping_status = final_report['ping'].get('status', 'UNKNOWN')
    
    print(f"HTTP (puerto 80): {http_status}")
    print(f"HTTPS (puerto 443): {https_status}")
    print(f"Ping: {ping_status}")
    
    # Mostrar recomendaciones
    if final_report['recommendations']:
        print(f"\n📋 Recomendaciones:")
        for i, rec in enumerate(final_report['recommendations'], 1):
            print(f"   {i}. {rec}")
    
    # Guardar reporte en archivo JSON
    report_file = '/workspace/shadcn-ui/lukspeed_dns_verification_report.json'
    with open(report_file, 'w') as f:
        json.dump(final_report, f, indent=2, default=str)
    
    print(f"\n📄 Reporte completo guardado: {report_file}")
    
    # Mostrar siguiente paso recomendado
    print(f"\n🚀 PRÓXIMO PASO RECOMENDADO:")
    if "READY FOR DEPLOYMENT" in final_report['overall_status']:
        print("   ✅ PROCEDER CON DEPLOYMENT A PRODUCCIÓN")
        print("   🌐 Domain está listo para recibir tráfico")
    elif "PROPAGATING" in final_report['overall_status']:
        print("   ⏳ ESPERAR PROPAGACIÓN DNS (revisar en 2-4 horas)")
        print("   🔄 DNS configurado correctamente, solo falta tiempo")
    elif "CONFIGURED" in final_report['overall_status']:
        print("   ⏳ ESPERAR PROPAGACIÓN INICIAL (revisar en 1-2 horas)")
        print("   🔧 Configuration detected, propagation starting")
    else:
        print("   🔧 VERIFICAR CONFIGURACIÓN DNS EN GODADDY")
        print("   📋 Review DNS settings and ensure proper configuration")

except Exception as e:
    print(f"\n❌ ERROR EN VERIFICACIÓN: {e}")
    print("Intente ejecutar verificación manual con:")
    print("   dig lukspeed.com")
    print("   ping lukspeed.com")

print(f"\n🎉 VERIFICACIÓN DNS COMPLETADA!")
print("=" * 60)