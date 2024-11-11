// Define constants for power limits
const MAX_POWER_CAPACITY = 100; // Total power available
const SAFETY_LIMIT = 92; // Safe operational limit
const DEVICE_MAX_POWER = 40; // Maximum power a device can draw

// Class to represent a Device
class Device {
    constructor(id, power = 0) {
        this.id = id; // Unique device ID
        this.power = power; // Current power consumption of the device
    }

    setPower(power) {
        this.power = power;
    }
}

// Class to manage power distribution
class PowerManager {
    constructor() {
        this.devices = []; // FIFO queue of active devices
        this.totalPowerUsed = 0; // Track current power consumption
    }

    // Method to add a new device and allocate power
    connectDevice(device) {
        console.log(`Connecting Device ${device.id}`);

        // Calculate initial power allocation for the new device
        let availablePower = SAFETY_LIMIT - this.totalPowerUsed;
        let powerToAllocate = Math.min(DEVICE_MAX_POWER, availablePower);

        // Set the device power and update total usage
        device.setPower(powerToAllocate);
        this.totalPowerUsed += powerToAllocate;

        // Add the device to the FIFO queue
        this.devices.push(device);

        this.printStatus();
    }

    // Method to disconnect a device and redistribute power
    disconnectDevice(deviceId) {
        console.log(`Disconnecting Device ${deviceId}`);

        // Find the device index and remove it from the queue
        const deviceIndex = this.devices.findIndex((device) => device.id === deviceId);
        if (deviceIndex === -1) return; // Device not found

        const device = this.devices[deviceIndex];
        this.totalPowerUsed -= device.power; // Deduct device's power from total
        this.devices.splice(deviceIndex, 1); // Remove device from queue

        // Redistribute available power among remaining devices
        this.redistributePower();

        this.printStatus();
    }

    // Method to handle power change for an active device
    changeDevicePower(deviceId, newPower) {
        console.log(`Changing Device ${deviceId} power to ${newPower}`);

        const device = this.devices.find((device) => device.id === deviceId);
        if (!device) return; // Device not found

        // Adjust the total power used based on the new requested power
        this.totalPowerUsed -= device.power;
        device.setPower(newPower);
        this.totalPowerUsed += newPower;

        // Check if total usage exceeds safety limit and adjust
        this.redistributePower();

        this.printStatus();
    }

    // Redistribute power among devices to maintain FIFO and safety constraints
    redistributePower() {
        let availablePower = SAFETY_LIMIT - this.totalPowerUsed;

        for (const device of this.devices) {
            if (availablePower <= 0) break; // No power left to distribute

            const additionalPower = Math.min(DEVICE_MAX_POWER - device.power, availablePower);
            if (additionalPower > 0) {
                device.setPower(device.power + additionalPower);
                this.totalPowerUsed += additionalPower;
                availablePower -= additionalPower;
            }
        }
    }

    // Print current status of power allocation for debugging
    printStatus() {
        console.log("Current power distribution:");
        this.devices.forEach((device) => {
            console.log(`Device ${device.id} → ${device.power} units`);
        });
        console.log(`Total Power Used: ${this.totalPowerUsed} units\n`);
    }
}

// Example usage of the system

const powerManager = new PowerManager();

const deviceA = new Device("A");
const deviceB = new Device("B");
const deviceC = new Device("C");

powerManager.connectDevice(deviceA); // t=0
powerManager.connectDevice(deviceB); // t=1
powerManager.connectDevice(deviceC); // t=2

powerManager.changeDevicePower("A", 20); // t=3
powerManager.disconnectDevice("B"); // t=4
