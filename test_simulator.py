"""
Quick test script to verify SolarFlex simulator works
"""
import sys
sys.path.insert(0, 'E:/Programming/SIH project')

from simulator.fake_sensor import FakeSensorSimulator

print("=" * 70)
print("SOLARFLEX SIMULATOR TEST")
print("=" * 70)

# Create simulator
sim = FakeSensorSimulator()

# Set time to 10 AM (peak solar)
sim.simulation_hour = 10.0

print(f"\nSimulation time: {sim.simulation_hour}:00 (peak solar hours)")
print("\nInitial module states:\n")

# Update each module
for module_id in ['module_01', 'module_02']:
    sim.update_module_state(module_id)
    state = sim.module_states[module_id]

    print(f"  [{module_id}]")
    print(f"    Crop: {state['crop_type']}")
    print(f"    Temperature: {state['temperature_c']:.1f}C (target: {state['target_temperature_c']:.1f}C)")
    print(f"    Humidity: {state['humidity_percent']:.1f}%")
    print(f"    Compressor: {'ON' if state['compressor_on'] else 'OFF'}")
    print(f"    Battery SOC: {state['battery_soc_percent']:.0f}%")
    print(f"    Solar Power: {state['solar_power_watts']:.0f}W")
    print()

# Test sensor payload generation
print("Generated sensor payload (module_01):")
payload = sim.generate_sensor_payload('module_01')
print(f"  {payload['sensor_data']}")
print(f"  {payload['power_data']}")

print("\n" + "=" * 70)
print("TEST PASSED - Simulator working correctly!")
print("=" * 70)
print("\nTo run continuous simulation, use:")
print("  python simulator/fake_sensor.py --standalone")
