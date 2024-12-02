import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class CharacterActivity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  defaultActivityName: string | null;

  @Column({ nullable: true })
  defaultActivityParams: string | null;

  @Column({ nullable: true })
  activityName: string | null;

  @Column({ nullable: true })
  activityParams: string | null;

  @Column({ nullable: true })
  error: string | null;
}
