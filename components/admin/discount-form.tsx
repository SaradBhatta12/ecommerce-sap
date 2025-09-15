"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

interface Product {
  _id: string;
  name: string;
}

interface Category {
  _id: string;
  name: string;
}

interface DiscountFormProps {
  discountId?: string;
}

const formSchema = z
  .object({
    code: z
      .string()
      .min(3, { message: "Discount code must be at least 3 characters" })
      .max(20, { message: "Discount code must be at most 20 characters" })
      .regex(/^[A-Z0-9]+$/, {
        message: "Discount code must be uppercase letters and numbers only",
      }),
    type: z.enum(["percentage", "fixed"]),
    value: z.coerce.number().positive({ message: "Value must be positive" }),
    minPurchase: z.coerce
      .number()
      .nonnegative({ message: "Minimum purchase must be non-negative" })
      .optional(),
    maxDiscount: z.coerce
      .number()
      .nonnegative({ message: "Maximum discount must be non-negative" })
      .optional(),
    startDate: z.date({
      required_error: "Start date is required",
    }),
    endDate: z.date({
      required_error: "End date is required",
    }),
    isActive: z.boolean().default(true),
    usageLimit: z.coerce
      .number()
      .int({ message: "Usage limit must be an integer" })
      .nonnegative({ message: "Usage limit must be non-negative" })
      .optional(),
    applicableProducts: z.array(z.string()).optional(),
    applicableCategories: z.array(z.string()).optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });

type FormValues = z.infer<typeof formSchema>;

export function DiscountForm({ discountId }: DiscountFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      type: "percentage",
      value: 0,
      minPurchase: undefined,
      maxDiscount: undefined,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      isActive: true,
      usageLimit: undefined,
      applicableProducts: [],
      applicableCategories: [],
    },
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("Failed to fetch products");

        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        console.log(response);
        if (!response.ok) throw new Error("Failed to fetch categories");

        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchProducts();
    fetchCategories();

    if (discountId) {
      fetchDiscount();
    }
  }, [discountId]);

  const fetchDiscount = async () => {
    try {
      setIsFetching(true);

      const response = await fetch(`/api/admin/discounts/${discountId}`);
      if (!response.ok) throw new Error("Failed to fetch discount");

      const { discount } = await response.json();

      form.reset({
        ...discount,
        startDate: new Date(discount.startDate),
        endDate: new Date(discount.endDate),
        applicableProducts: discount.applicableProducts || [],
        applicableCategories: discount.applicableCategories || [],
      });
    } catch (error) {
      console.error("Error fetching discount:", error);
      toast({
        title: "Error",
        description: "Failed to load discount data",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);

      const url = discountId
        ? `/api/admin/discounts/${discountId}`
        : "/api/admin/discounts";

      const method = discountId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save discount");
      }

      toast({
        title: "Success",
        description: `Discount ${
          discountId ? "updated" : "created"
        } successfully`,
      });

      router.push("/admin/discounts");
    } catch (error: any) {
      console.error("Error saving discount:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save discount",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="SUMMER2023"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value.toUpperCase())
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Uppercase letters and numbers only
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select discount type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage</SelectItem>
                          <SelectItem value="fixed">Fixed Amount</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {form.watch("type") === "percentage"
                          ? "Percentage off the total price"
                          : "Fixed amount off the total price"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {form.watch("type") === "percentage"
                          ? "Percentage Value"
                          : "Fixed Amount"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder={
                            form.watch("type") === "percentage" ? "10" : "500"
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {form.watch("type") === "percentage"
                          ? "Enter percentage without the % symbol"
                          : "Enter amount in Rs."}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("type") === "percentage" && (
                  <FormField
                    control={form.control}
                    name="maxDiscount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Discount Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="1000"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? undefined
                                  : Number(e.target.value)
                              )
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum amount that can be discounted (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="minPurchase"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Purchase Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1000"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum cart value required (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="w-full pl-3 text-left font-normal"
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="w-full pl-3 text-left font-normal"
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date <
                                new Date(
                                  form.getValues("startDate") ||
                                    new Date().setHours(0, 0, 0, 0)
                                )
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="usageLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usage Limit</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="100"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum number of times this discount can be used
                        (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Active Status</FormLabel>
                        <FormDescription>
                          Enable or disable this discount
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Discount Applicability</h3>
              <p className="text-sm text-muted-foreground">
                Select specific products or categories this discount applies to
                (leave empty to apply to all products)
              </p>

              <FormField
                control={form.control}
                name="applicableProducts"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Products</FormLabel>
                      <FormDescription>
                        Select products this discount applies to
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {products.map((product) => (
                        <FormField
                          key={product._id}
                          control={form.control}
                          name="applicableProducts"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={product._id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(product._id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([
                                            ...(field.value || []),
                                            product._id,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== product._id
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {product.name}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="applicableCategories"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Categories</FormLabel>
                      <FormDescription>
                        Select categories this discount applies to
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {Array.isArray(categories) &&
                        categories.map((category) => (
                          <FormField
                            key={category._id}
                            control={form.control}
                            name="applicableCategories"
                            render={({ field }) => (
                              <FormItem
                                key={category._id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(
                                      category._id
                                    )}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([
                                            ...(field.value || []),
                                            category._id,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== category._id
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {category.name}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/discounts")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {discountId ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>{discountId ? "Update" : "Create"} Discount</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
