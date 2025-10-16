import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { USER_ROLE } from '../enums/roles.enum';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    length: 50,
    type: 'varchar',
  })
  name: string;

  @Column({
    length: 50,
    type: 'varchar',
    unique: true,
  })
  email: string;

  @Column({
    length: 20,
    type: 'varchar',
    unique: true,
  })
  username: string;

  @Exclude()
  @Column({
    type: 'varchar',
  })
  password: string;

  @Index()
  @Exclude()
  @Column({ type: 'varchar', nullable: true })
  refreshToken: string | null;

  @Column({
    type: 'enum',
    enum: USER_ROLE,
    default: USER_ROLE.USER,
  })
  role?: USER_ROLE;

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;
}
