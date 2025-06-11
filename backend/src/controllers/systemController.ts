import { Request, Response } from 'express';
import osu from 'os-utils';
import si from 'systeminformation';

let lastNetStats = {
  tx_bytes: 0,
  rx_bytes: 0,
  timestamp: Date.now()
};

export const getSystemStats = async (req: Request, res: Response) => {
  osu.cpuUsage(async cpu => {
    const mem = osu.freememPercentage();
    const ram = 100 - mem * 100;
    let sent_speed = 0, recv_speed = 0;
    try {
      const netStatsArr = await si.networkStats();
      let tx_bytes = 0, rx_bytes = 0;
      for (const net of netStatsArr) {
        tx_bytes += net.tx_bytes;
        rx_bytes += net.rx_bytes;
      }
      const now = Date.now();
      const elapsed = (now - lastNetStats.timestamp) / 1000;
      if (elapsed > 0) {
        sent_speed = (tx_bytes - lastNetStats.tx_bytes) / elapsed;
        recv_speed = (rx_bytes - lastNetStats.rx_bytes) / elapsed;
      }
      lastNetStats = { tx_bytes, rx_bytes, timestamp: now };
    } catch (err) {
      sent_speed = 0;
      recv_speed = 0;
    }
    res.json({
      cpu: Math.round(cpu * 100),
      ram: Math.round(ram),
      net: {
        sent: Math.round(sent_speed),
        recv: Math.round(recv_speed)
      }
    });
  });
};

export const control = async (req: Request, res: Response) => {
  const { action, direction } = req.body;
  if (!action) {
    res.status(400).json({ error: 'No action provided' });
  } else {
    res.json({ success: true, result: `Action: ${action}, Direction: ${direction || 'none'}` });
  }
};
