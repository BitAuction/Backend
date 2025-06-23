import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BidMonitorService } from './bid-monitor/bid-monitor.service';
import { FabricService } from './fabric/fabric.service';

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

  await app.listen(process.env.PORT ?? 4000);

  // enroll admins for each organization
  const fabricService = app.get(FabricService);
  const orgs = ['Org1', 'Org2', 'Org3', 'Org4'];
  for (const org of orgs) {
    await fabricService.enrollAdminForOrg(org);
  }

  // start the bid monitoring service
  const bidMonitorService = app.get(BidMonitorService);
  await bidMonitorService.startMonitoring();
}
bootstrap();
