-- Table: public.files

-- DROP TABLE IF EXISTS public.files;

CREATE TABLE IF NOT EXISTS public.files
(
    id integer NOT NULL DEFAULT nextval('files_id_seq'::regclass),
    original_filename character varying(255) COLLATE pg_catalog."default" NOT NULL,
    storage_path text COLLATE pg_catalog."default",
    title character varying(255) COLLATE pg_catalog."default",
    description text COLLATE pg_catalog."default",
    status files_status_enum NOT NULL DEFAULT 'pending'::files_status_enum,
    extracted_data text COLLATE pg_catalog."default",
    uploaded_at timestamp without time zone NOT NULL DEFAULT now(),
    user_id integer,
    CONSTRAINT "PK_6c16b9093a142e0e7613b04a3d9" PRIMARY KEY (id),
    CONSTRAINT "FK_a7435dbb7583938d5e7d1376041" FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.files
    OWNER to postgres;