import { DiscountForm } from "@/components/admin/discount-form";

export default function EditDiscountPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className=" mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Discount</h1>
      <DiscountForm discountId={params.id} />
    </div>
  );
}
