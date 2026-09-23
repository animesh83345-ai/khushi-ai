import os from "os";

/*
=========================================
SYSTEM MONITOR
=========================================
*/

export function getSystemStats() {

  const totalMemory =
    os.totalmem();

  const freeMemory =
    os.freemem();

  const usedMemory =
    totalMemory -
    freeMemory;

  const cpus =
    os.cpus();

  return {

    platform:
      os.platform(),

    architecture:
      os.arch(),

    hostname:
      os.hostname(),

    cpuModel:
      cpus?.[0]?.model ||
      "Unknown",

    cpuCores:
      cpus?.length || 0,

    memoryTotalGB:
      Number(
        (
          totalMemory /
          1024 ** 3
        ).toFixed(2)
      ),

    memoryUsedGB:
      Number(
        (
          usedMemory /
          1024 ** 3
        ).toFixed(2)
      ),

    memoryFreeGB:
      Number(
        (
          freeMemory /
          1024 ** 3
        ).toFixed(2)
      ),

    memoryUsagePercent:
      Number(
        (
          (usedMemory /
            totalMemory) *
          100
        ).toFixed(1)
      ),

    uptimeMinutes:
      Number(
        (
          os.uptime() /
          60
        ).toFixed(1)
      ),

    nodeVersion:
      process.version,

    serverUptimeSeconds:
      Math.floor(
        process.uptime()
      )
  };
}
