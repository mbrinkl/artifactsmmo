import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class CharInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  activityName: string;

  @Column({ nullable: true })
  activityParams: string;
}
