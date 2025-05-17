import { UploadFile } from "../../files/entities/upload-file.entity";
import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";

@Entity({
    name: "users"
})
export class User {
    @PrimaryColumn({
        type: "int",
        generated: true,
        name: "id",
        primary: true
    })
    id: number;

    @Column({
        type: "varchar",
        length: 255,
        nullable: false,
        name: "username"
    })
    password: string;

    @Column({
        type: "varchar",
        length: 255,
        unique: true,
        nullable: false,
        name: "email"
    })
    email: string;

    @Column({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        nullable: false,
        name: "created_at"
    })
    created_at: Date;

    @OneToMany(() => UploadFile, (file) => file.user_id, { onDelete: "CASCADE" })
    files: UploadFile[];
}
