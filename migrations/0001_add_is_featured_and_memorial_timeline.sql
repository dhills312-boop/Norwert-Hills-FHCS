CREATE TABLE "memorial_timeline_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"announcement_id" varchar NOT NULL,
	"event_year" varchar(20) NOT NULL,
	"event_label" varchar(200) NOT NULL,
	"event_description" varchar(500),
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "session_doc_checklist" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"arrangement_id" varchar NOT NULL,
	"document_received" boolean DEFAULT false NOT NULL,
	"filed_to_case" boolean DEFAULT false NOT NULL,
	"certificate_submitted" boolean DEFAULT false NOT NULL,
	"certificate_approved" boolean DEFAULT false NOT NULL,
	"ssn_purged" boolean DEFAULT false NOT NULL,
	"notes" text,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "session_doc_checklist_arrangement_id_unique" UNIQUE("arrangement_id")
);
--> statement-breakpoint
ALTER TABLE "announcements" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "announcements" ADD COLUMN "memorial_status" text DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "announcements" ADD COLUMN "scheduled_at" timestamp;--> statement-breakpoint
ALTER TABLE "arrangements" ADD COLUMN "case_token" text;--> statement-breakpoint
ALTER TABLE "arrangements" ADD COLUMN "deceased_name" text;--> statement-breakpoint
ALTER TABLE "arrangements" ADD COLUMN "authorizing_agent_name" text;--> statement-breakpoint
ALTER TABLE "arrangements" ADD COLUMN "authorizing_agent_phone" text;--> statement-breakpoint
ALTER TABLE "arrangements" ADD COLUMN "authorizing_agent_email" text;--> statement-breakpoint
ALTER TABLE "arrangements" ADD COLUMN "authorizing_agent_address" text;--> statement-breakpoint
ALTER TABLE "arrangements" ADD COLUMN "relationship_to_deceased" text;--> statement-breakpoint
ALTER TABLE "arrangements" ADD COLUMN "assigned_staff_name" text;--> statement-breakpoint
ALTER TABLE "cremation_orders" ADD COLUMN "drive_root_folder_url" text;--> statement-breakpoint
ALTER TABLE "cremation_orders" ADD COLUMN "drive_subfolders" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "form_instances" ADD COLUMN "pandadoc_document_id" text;--> statement-breakpoint
ALTER TABLE "form_instances" ADD COLUMN "external_link" text;--> statement-breakpoint
ALTER TABLE "form_instances" ADD COLUMN "recipient_name" text;--> statement-breakpoint
ALTER TABLE "form_instances" ADD COLUMN "recipient_email" text;--> statement-breakpoint
ALTER TABLE "form_templates" ADD COLUMN "type" text DEFAULT 'jotform' NOT NULL;--> statement-breakpoint
ALTER TABLE "form_templates" ADD COLUMN "category" text DEFAULT 'intake' NOT NULL;--> statement-breakpoint
ALTER TABLE "form_templates" ADD COLUMN "jotform_url" text;--> statement-breakpoint
ALTER TABLE "form_templates" ADD COLUMN "pandadoc_template_id" text;--> statement-breakpoint
ALTER TABLE "form_templates" ADD COLUMN "pandadoc_recipient_role" text DEFAULT 'Authorizing Agent';--> statement-breakpoint
ALTER TABLE "form_templates" ADD COLUMN "auth_workflow_group" text;--> statement-breakpoint
ALTER TABLE "service_catalog" ADD COLUMN "sale_price" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "cremation_documents" ADD CONSTRAINT "cremation_documents_order_id_cremation_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."cremation_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cremation_events" ADD CONSTRAINT "cremation_events_order_id_cremation_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."cremation_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arrangements" ADD CONSTRAINT "arrangements_case_token_unique" UNIQUE("case_token");