import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class CharacterActivity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  defaultActivity: string | null;

  @Column({ nullable: true })
  currentActivity: string | null;

  @Column({ nullable: true })
  error: string | null;
}
