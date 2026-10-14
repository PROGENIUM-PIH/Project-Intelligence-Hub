-- Allow tasks to be created without a due date.
ALTER TABLE "Task" ALTER COLUMN "dueDate" DROP NOT NULL;
