import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BidMonitorService } from './bid-monitor/bid-monitor.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'http://localhost:3002',
    'http://localhost:3003',
  ];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);

  // Start bid monitoring and simulation
  const bidMonitorService = app.get(BidMonitorService);
  await bidMonitorService.startMonitoring();
  await bidMonitorService.startRandomBidSimulation();

  console.log('🚀 Auction platform started with live bid monitoring!');
  console.log('📡 WebSocket server running on port 3000');
  console.log('🎲 Random bid simulation active (every 5 seconds)');
}
bootstrap();
