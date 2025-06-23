import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['userId', 'auctionId', 'type'])
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  auctionId: string;

  @Column()
  type: 'winner' | 'timeout';

  @CreateDateColumn()
  timestamp: Date;

  @Column({ default: false })
  seen: boolean;
}
