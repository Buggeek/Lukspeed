#!/usr/bin/env python3
"""
🌐 LUKSPEED.COM DNS VERIFICATION - PYTHON NATIVE
Verificación completa usando solo Python stdlib
"""

import socket
import json
import time
from datetime import datetime
import urllib.request
import urllib.error

print("🌐 LUKSPEED.COM DNS VERIFICATION - PYTHON NATIVE")
print("=" * 60)

def resolve_domain_python(domain):
    """Resolver DNS usando Python nativo"""
    try:
        ip_addresses = socket.gethostbyname_ex(domain)
        return {
            "status": "SUCCESS",
            "hostname": ip_addresses[0],
            "aliases": ip_addresses[1],
            "ip_addresses": ip_addresses[2]
        }
    except socket.gaierror as e:
        return {
            "status": "FAILED",
            "error": str(e)
        }
    except Exception as e:
        return {
            "status": "ERROR", 
            "error": str(e)
        }

def check_basic_dns_python():
    """Verificación DNS básica usando Python"""
    print("\n🔍 PASO 1: VERIFICACIÓN DNS BÁSICA (Python Native)")
    print("-" * 50)
    
    domains_to_check = ["lukspeed.com", "www.lukspeed.com"]
    dns_results = {}
    
    for domain in domains_to_check:
        print(f"\n🔍 Verificando {domain}...")
        result = resolve_domain_python(domain)
        
        if result["status"] == "SUCCESS":
            print(f"✅ {domain} resuelve a: {result['ip_addresses']}")
            dns_results[domain] = {
                "resolved": True,
                "ip_addresses": result['ip_addresses'],
                "hostname": result['hostname'],
                "aliases": result['aliases']
            }
            
            # Identificar posible hosting provider
            ips = result['ip_addresses']
            hosting_provider = "Unknown"
            
            # Rangos conocidos de proveedores
            vercel_patterns = ['76.76.', '76.223.', '64.227.']
            netlify_patterns = ['75.2.', '99.83.', '3.33.']
            cloudflare_patterns = ['104.21.', '172.67.', '104.26.']
            
            for ip in ips:
                if any(ip.startswith(pattern) for pattern in vercel_patterns):
                    hosting_provider = "Vercel"
                    break
                elif any(ip.startswith(pattern) for pattern in netlify_patterns):
                    hosting_provider = "Netlify"  
                    break
                elif any(ip.startswith(pattern) for pattern in cloudflare_patterns):
                    hosting_provider = "Cloudflare"
                    break
            
            dns_results[domain]["hosting_provider"] = hosting_provider
            print(f"   Posible hosting: {hosting_provider}")
            
        else:
            print(f"❌ {domain}: {result.get('error', 'Resolution failed')}")
            dns_results[domain] = {
                "resolved": False,
                "error": result.get('error', 'Resolution failed')
            }
    
    return dns_results

def check_connectivity_python():
    """Verificar conectividad usando sockets Python"""
    print("\n🔗 PASO 2: TESTS DE CONECTIVIDAD")
    print("-" * 35)
    
    connectivity_results = {}
    
    # Test puertos HTTP y HTTPS
    ports_to_test = {
        "HTTP": 80,
        "HTTPS": 443
    }
    
    for service, port in ports_to_test.items():
        print(f"\n🔍 Verificando {service} (puerto {port})...")
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(10)
            
            start_time = time.time()
            result = sock.connect_ex(('lukspeed.com', port))
            connection_time = time.time() - start_time
            sock.close()
            
            if result == 0:
                connectivity_results[service] = {
                    "status": "OPEN",
                    "port": port,
                    "connection_time_ms": round(connection_time * 1000, 2)
                }
                print(f"✅ Puerto {port} ({service}) está abierto ({connection_time*1000:.0f}ms)")
            else:
                connectivity_results[service] = {
                    "status": "CLOSED",
                    "port": port,
                    "error_code": result
                }
                print(f"❌ Puerto {port} ({service}) cerrado (código: {result})")
                
        except Exception as e:
            connectivity_results[service] = {
                "status": "ERROR",
                "port": port,
                "error": str(e)
            }
            print(f"❌ Error verificando puerto {port}: {e}")
    
    return connectivity_results

def check_http_response():
    """Verificar respuesta HTTP básica"""
    print("\n📡 PASO 3: TEST DE RESPUESTA HTTP")
    print("-" * 35)
    
    urls_to_test = [
        "http://lukspeed.com",
        "https://lukspeed.com"
    ]
    
    http_results = {}
    
    for url in urls_to_test:
        print(f"\n🔍 Probando {url}...")
        try:
            start_time = time.time()
            
            # Crear request con timeout
            request = urllib.request.Request(url)
            request.add_header('User-Agent', 'LukSpeed-DNS-Checker/1.0')
            
            with urllib.request.urlopen(request, timeout=15) as response:
                response_time = time.time() - start_time
                content_length = len(response.read())
                
                http_results[url] = {
                    "status": "SUCCESS",
                    "status_code": response.status,
                    "response_time_ms": round(response_time * 1000, 2),
                    "content_length": content_length,
                    "headers": dict(response.headers)
                }
                
                print(f"✅ {url}: {response.status} ({response_time*1000:.0f}ms)")
                print(f"   Content-Length: {content_length} bytes")
                
                # Verificar headers importantes
                server = response.headers.get('Server', 'Unknown')
                if server != 'Unknown':
                    print(f"   Server: {server}")
                
        except urllib.error.HTTPError as e:
            http_results[url] = {
                "status": "HTTP_ERROR",
                "status_code": e.code,
                "error": str(e)
            }
            print(f"❌ {url}: HTTP {e.code} - {e}")
            
        except urllib.error.URLError as e:
            http_results[url] = {
                "status": "URL_ERROR", 
                "error": str(e)
            }
            print(f"❌ {url}: URL Error - {e}")
            
        except Exception as e:
            http_results[url] = {
                "status": "ERROR",
                "error": str(e)
            }
            print(f"❌ {url}: {e}")
    
    return http_results

def check_dns_propagation_estimation():
    """Estimar propagación DNS basado en resolución local"""
    print("\n🌍 PASO 4: ESTIMACIÓN PROPAGACIÓN DNS")
    print("-" * 40)
    
    domain = "lukspeed.com"
    propagation_indicators = {}
    
    # Test múltiples resoluciones para detectar consistencia
    print(f"🔍 Probando resolución múltiple de {domain}...")
    
    resolution_attempts = []
    for i in range(5):
        try:
            result = socket.gethostbyname(domain)
            resolution_attempts.append(result)
            time.sleep(0.5)  # Pequeña pausa entre intentos
        except Exception as e:
            resolution_attempts.append(f"ERROR: {e}")
    
    successful_resolutions = [r for r in resolution_attempts if not r.startswith("ERROR")]
    unique_ips = list(set(successful_resolutions))
    
    propagation_indicators = {
        "total_attempts": len(resolution_attempts),
        "successful_resolutions": len(successful_resolutions),
        "unique_ips": unique_ips,
        "consistency": len(unique_ips) <= 2,  # Buena señal si hay 1-2 IPs únicos
        "success_rate": len(successful_resolutions) / len(resolution_attempts) * 100
    }
    
    print(f"📊 Intentos de resolución: {len(resolution_attempts)}")
    print(f"📊 Resoluciones exitosas: {len(successful_resolutions)}")
    print(f"📊 IPs únicos encontrados: {unique_ips}")
    print(f"📊 Tasa de éxito: {propagation_indicators['success_rate']:.1f}%")
    
    if propagation_indicators['success_rate'] >= 80:
        print("✅ Propagación parece estable")
        estimated_status = "STABLE"
    elif propagation_indicators['success_rate'] >= 40:
        print("⚠️ Propagación parcial detectada")
        estimated_status = "PARTIAL"
    else:
        print("❌ Propagación muy limitada o ausente")
        estimated_status = "LIMITED"
    
    propagation_indicators['estimated_status'] = estimated_status
    
    return propagation_indicators

def generate_comprehensive_report():
    """Generar reporte completo usando métodos Python nativos"""
    print("\n📋 PASO 5: GENERANDO REPORTE COMPLETO")
    print("-" * 40)
    
    # Ejecutar todas las verificaciones
    dns_results = check_basic_dns_python()
    connectivity_results = check_connectivity_python()
    http_results = check_http_response()
    propagation_results = check_dns_propagation_estimation()
    
    # Crear reporte completo
    report = {
        "domain": "lukspeed.com",
        "verification_timestamp": datetime.now().isoformat(),
        "verification_method": "Python Native (socket + urllib)",
        "dns_resolution": dns_results,
        "connectivity": connectivity_results, 
        "http_response": http_results,
        "propagation_estimation": propagation_results,
        "overall_status": "UNKNOWN",
        "recommendations": []
    }
    
    # Determinar estado general
    lukspeed_resolved = dns_results.get("lukspeed.com", {}).get("resolved", False)
    www_resolved = dns_results.get("www.lukspeed.com", {}).get("resolved", False)
    http_working = any(r.get("status") == "SUCCESS" for r in http_results.values())
    https_port_open = connectivity_results.get("HTTPS", {}).get("status") == "OPEN"
    propagation_stable = propagation_results.get("estimated_status") == "STABLE"
    
    # Lógica de estado
    if lukspeed_resolved and http_working and https_port_open:
        report["overall_status"] = "✅ READY FOR DEPLOYMENT"
        report["status_details"] = "Domain fully functional and accessible"
    elif lukspeed_resolved and (http_working or https_port_open):
        report["overall_status"] = "🟡 MOSTLY READY - Minor Issues"
        report["status_details"] = "Domain working but some services may need attention"
    elif lukspeed_resolved and propagation_stable:
        report["overall_status"] = "🔄 DNS RESOLVED - Service Starting"
        report["status_details"] = "DNS working, waiting for web services"
    elif lukspeed_resolved:
        report["overall_status"] = "⚠️ DNS RESOLVED - Services Not Ready"
        report["status_details"] = "Domain resolves but web services not responding"
    else:
        report["overall_status"] = "❌ DNS NOT RESOLVED"
        report["status_details"] = "Domain is not resolving to any IP address"
    
    # Generar recomendaciones específicas
    if not lukspeed_resolved:
        report["recommendations"].append("Check DNS configuration in GoDaddy - A record may not be set")
    
    if lukspeed_resolved and not http_working and not https_port_open:
        report["recommendations"].append("Deploy application to hosting provider (Vercel/Netlify)")
    
    if lukspeed_resolved and not www_resolved:
        report["recommendations"].append("Configure CNAME record for www.lukspeed.com")
    
    if propagation_results.get("success_rate", 0) < 80:
        report["recommendations"].append("Wait for DNS propagation to stabilize (normal: 1-24 hours)")
    
    return report

# EJECUTAR VERIFICACIÓN COMPLETA
try:
    print("🚀 Iniciando verificación completa de lukspeed.com...")
    final_report = generate_comprehensive_report()
    
    # Mostrar resumen ejecutivo
    print(f"\n🎯 RESUMEN EJECUTIVO LUKSPEED.COM")
    print("=" * 40)
    print(f"Estado general: {final_report['overall_status']}")
    print(f"Detalles: {final_report['status_details']}")
    
    # Mostrar DNS resolution status
    lukspeed_dns = final_report['dns_resolution'].get('lukspeed.com', {})
    www_dns = final_report['dns_resolution'].get('www.lukspeed.com', {})
    
    if lukspeed_dns.get('resolved'):
        ips = lukspeed_dns.get('ip_addresses', [])
        provider = lukspeed_dns.get('hosting_provider', 'Unknown')
        print(f"DNS lukspeed.com: ✅ {ips} (Host: {provider})")
    else:
        print(f"DNS lukspeed.com: ❌ No resuelve")
    
    if www_dns.get('resolved'):
        ips = www_dns.get('ip_addresses', [])
        print(f"DNS www.lukspeed.com: ✅ {ips}")
    else:
        print(f"DNS www.lukspeed.com: ❌ No resuelve")
    
    # Mostrar conectividad
    http_status = final_report['connectivity'].get('HTTP', {}).get('status', 'UNKNOWN')
    https_status = final_report['connectivity'].get('HTTPS', {}).get('status', 'UNKNOWN')
    print(f"Puerto 80 (HTTP): {http_status}")
    print(f"Puerto 443 (HTTPS): {https_status}")
    
    # Mostrar respuesta HTTP
    http_response = final_report['http_response']
    for url, result in http_response.items():
        status = result.get('status', 'UNKNOWN')
        if status == 'SUCCESS':
            code = result.get('status_code', 'N/A')
            time_ms = result.get('response_time_ms', 'N/A')
            print(f"{url}: ✅ {code} ({time_ms}ms)")
        else:
            print(f"{url}: ❌ {status}")
    
    # Mostrar propagación
    prop_rate = final_report['propagation_estimation'].get('success_rate', 0)
    prop_status = final_report['propagation_estimation'].get('estimated_status', 'UNKNOWN')
    print(f"Propagación estimada: {prop_rate:.1f}% ({prop_status})")
    
    # Mostrar recomendaciones
    if final_report['recommendations']:
        print(f"\n📋 RECOMENDACIONES:")
        for i, rec in enumerate(final_report['recommendations'], 1):
            print(f"   {i}. {rec}")
    
    # Guardar reporte
    report_file = '/workspace/shadcn-ui/lukspeed_dns_verification_report.json'
    with open(report_file, 'w') as f:
        json.dump(final_report, f, indent=2, default=str)
    
    print(f"\n📄 Reporte completo guardado: {report_file}")
    
    # Mostrar próximos pasos
    print(f"\n🚀 PRÓXIMOS PASOS RECOMENDADOS:")
    if "READY FOR DEPLOYMENT" in final_report['overall_status']:
        print("   ✅ PROCEDER CON DEPLOYMENT FINAL")
        print("   🌐 Domain completamente funcional")
        print("   🔗 Configurar aplicación en hosting provider")
    elif "MOSTLY READY" in final_report['overall_status']:
        print("   🔧 AJUSTES MENORES NECESARIOS")
        print("   ⚡ Domain funcional, optimizar servicios")
    elif "DNS RESOLVED" in final_report['overall_status']:
        print("   📤 DEPLOY APLICACIÓN A HOSTING")
        print("   🎯 DNS listo, falta deployment de código")
    else:
        print("   🔧 VERIFICAR CONFIGURACIÓN DNS EN GODADDY")
        print("   📋 Revisar A record y configuración básica")

except Exception as e:
    print(f"\n❌ ERROR EN VERIFICACIÓN: {e}")
    print("Verificación básica manual:")
    
    try:
        basic_dns = resolve_domain_python("lukspeed.com")
        if basic_dns["status"] == "SUCCESS":
            print(f"✅ lukspeed.com resuelve: {basic_dns['ip_addresses']}")
        else:
            print(f"❌ lukspeed.com no resuelve: {basic_dns.get('error', 'Unknown error')}")
    except Exception as basic_e:
        print(f"❌ Error en verificación básica: {basic_e}")

print(f"\n🎉 VERIFICACIÓN DNS COMPLETADA!")
print("=" * 60)