import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { FileStatus } from "../file-status.enum";
import { User } from "src/users/entities/user.entity";

@Entity({
    name: "files"
})
export class UploadFile {
    @PrimaryColumn({
        type: "int",
        generated: true,
        name: "id",
        primary: true
    })
    id: number;

    @ManyToOne(() => User, (user) => user.files, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user_id: User;

    @Column({
        type: "varchar",
        length: 255,
        nullable: false,
        name: "original_filename"
    })
    original_filename: string;

    @Column({
        type: "text",
        nullable: true,
        name: "storage_path"
    })
    storage_path: string;

    @Column({
        type: "varchar",
        length: 255,
        name: "title",
        nullable: true,
    })
    title: string;

    @Column({
        type: "text",
        nullable: true,
        name: "description"
    })
    description: string;

    @Column({
        type: "enum",
        enum: FileStatus,
        default: FileStatus.PENDING,
        name: "status"
    })
    status: FileStatus;

    @Column({
        type: "text",
        nullable: true,
        name: "extracted_data"
    })
    extracted_data: string;

    @Column({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        nullable: false,
        name: "uploaded_at"
    })
    uploaded_at: Date;
}