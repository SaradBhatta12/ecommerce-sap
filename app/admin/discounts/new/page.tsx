import { DiscountForm } from "@/components/admin/discount-form";

export default function NewDiscountPage() {
  return (
    <div className=" mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Create New Discount</h1>
      <DiscountForm />
    </div>
  );
}
