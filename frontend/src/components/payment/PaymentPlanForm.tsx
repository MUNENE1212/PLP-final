import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Clock, Tag, Flag, FileText, MessageCircle, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import type { PaymentPlanFormData, PlanType, Milestone } from '@/types/paymentPlan';
import { PLAN_TYPE_LABELS, PAYMENT_PLAN_CONSTRAINTS } from '@/types/paymentPlan';
import { createPlan, updatePlan, fetchPlanTypes } from '@/store/slices/paymentPlanSlice';
import { selectPlanTypes, selectPaymentPlansActionLoading, selectPaymentPlansError } from '@/store/slices/paymentPlanSlice';
import Button from '@/components/ui/Button';

interface PaymentPlanFormProps {
  serviceId: string;
  existingPlan?: PaymentPlanFormData & { _id?: string };
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormData extends PaymentPlanFormData {
  totalAmount?: number;
}

const PLAN_TYPE_ICONS: Record<PlanType, React.ReactNode> = {
  hourly: <Clock className="w-5 h-5" />,
  fixed: <Tag className="w-5 h-5" />,
  milestone: <Flag className="w-5 h-5" />,
  per_project: <FileText className="w-5 h-5" />,
  negotiable: <MessageCircle className="w-5 h-5" />
};

const PaymentPlanForm: React.FC<PaymentPlanFormProps> = ({
  serviceId,
  existingPlan,
  onSuccess,
  onCancel
}) => {
  const dispatch = useDispatch();
  const planTypes = useSelector(selectPlanTypes);
  const actionLoading = useSelector(selectPaymentPlansActionLoading);
  const error = useSelector(selectPaymentPlansError);

  const [selectedPlanType, setSelectedPlanType] = useState<PlanType>(existingPlan?.planType || 'hourly');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      service: serviceId,
      planType: existingPlan?.planType || 'hourly',
      hourlyRate: existingPlan?.hourlyRate || { amount: 0, currency: 'KES', minimumHours: 1 },
      fixedPrice: existingPlan?.fixedPrice || { amount: 0, currency: 'KES', includesMaterials: false },
      milestones: existingPlan?.milestones || [{ name: '', percentage: 100, isCompleted: false }],
      perProject: existingPlan?.perProject || { requiresQuote: true },
      deposit: existingPlan?.deposit || { required: false, percentage: 0 },
      isActive: existingPlan?.isActive ?? true,
      cancellationPolicy: existingPlan?.cancellationPolicy || {
        freeCancellationHours: 24,
        cancellationFeePercent: 0
      },
      terms: existingPlan?.terms || '',
      totalAmount: 0
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'milestones' as never
  });

  // Fetch plan types on mount
  useEffect(() => {
    dispatch(fetchPlanTypes() as never);
  }, [dispatch]);

  // Watch milestone percentages to calculate amounts
  const milestones = watch('milestones');
  const totalAmount = watch('totalAmount');

  useEffect(() => {
    if (selectedPlanType === 'milestone' && totalAmount && milestones) {
      milestones.forEach((milestone, index) => {
        if (milestone.percentage) {
          const amount = (totalAmount * milestone.percentage) / 100;
          setValue(`milestones.${index}.amount`, amount);
        }
      });
    }
  }, [totalAmount, milestones, selectedPlanType, setValue]);

  const onSubmit = async (data: FormData) => {
    setSubmitError(null);

    try {
      // Prepare the data based on plan type
      const planData: PaymentPlanFormData = {
        service: serviceId,
        planType: data.planType,
        isActive: data.isActive,
        deposit: data.deposit,
        cancellationPolicy: data.cancellationPolicy,
        terms: data.terms
      };

      // Add plan-type specific fields
      switch (data.planType) {
        case 'hourly':
          planData.hourlyRate = data.hourlyRate;
          break;
        case 'fixed':
          planData.fixedPrice = data.fixedPrice;
          break;
        case 'milestone':
          planData.milestones = data.milestones?.map(m => ({
            ...m,
            amount: data.totalAmount ? (data.totalAmount * (m.percentage || 0)) / 100 : 0
          }));
          break;
        case 'per_project':
          planData.perProject = data.perProject;
          break;
        // negotiable has no additional fields
      }

      if (existingPlan?._id) {
        await dispatch(updatePlan({ planId: existingPlan._id, data: planData }) as never);
      } else {
        await dispatch(createPlan(planData) as never);
      }

      onSuccess?.();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save payment plan');
    }
  };

  const handlePlanTypeChange = (type: PlanType) => {
    setSelectedPlanType(type);
    setValue('planType', type);
  };

  const addMilestone = () => {
    append({ name: '', percentage: 0, isCompleted: false } as never);
  };

  const removeMilestone = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  // Calculate total milestone percentage
  const totalPercentage = milestones?.reduce((sum, m) => sum + (m.percentage || 0), 0) || 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Plan Type Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-[var(--dw-text-primary)]">
          Pricing Model
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(PLAN_TYPE_LABELS).map(([type, label]) => (
            <button
              key={type}
              type="button"
              onClick={() => handlePlanTypeChange(type as PlanType)}
              className={`p-3 rounded-lg border transition-all duration-200 flex flex-col items-center gap-2 ${
                selectedPlanType === type
                  ? 'border-[var(--dw-accent-primary)] bg-[var(--dw-color-info-bg)] text-[var(--dw-accent-primary)]'
                  : 'border-[var(--dw-border-default)] bg-[var(--dw-bg-secondary)] text-[var(--dw-text-secondary)] hover:border-[var(--dw-accent-primary)]'
              }`}
            >
              {PLAN_TYPE_ICONS[type as PlanType]}
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Hourly Rate Fields */}
      {selectedPlanType === 'hourly' && (
        <div className="space-y-4 p-4 bg-[var(--dw-bg-secondary)] rounded-lg border border-[var(--dw-border-subtle)]">
          <h4 className="text-sm font-medium text-[var(--dw-text-primary)]">Hourly Rate Configuration</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[var(--dw-text-secondary)] mb-1">Rate per Hour (KES)</label>
              <input
                type="number"
                {...register('hourlyRate.amount', {
                  required: 'Hourly rate is required',
                  min: { value: PAYMENT_PLAN_CONSTRAINTS.MIN_HOURLY_RATE, message: `Minimum is KES ${PAYMENT_PLAN_CONSTRAINTS.MIN_HOURLY_RATE}` }
                })}
                className="w-full px-3 py-2 bg-[var(--dw-bg-tertiary)] border border-[var(--dw-border-default)] rounded-md text-[var(--dw-text-primary)] focus:border-[var(--dw-accent-primary)] focus:outline-none"
                placeholder="e.g., 1500"
              />
              {errors.hourlyRate?.amount && (
                <p className="text-xs text-[var(--dw-color-error)] mt-1">{errors.hourlyRate.amount.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-[var(--dw-text-secondary)] mb-1">Minimum Hours</label>
              <input
                type="number"
                step="0.5"
                {...register('hourlyRate.minimumHours', {
                  min: { value: PAYMENT_PLAN_CONSTRAINTS.MIN_MINIMUM_HOURS, message: `Minimum is ${PAYMENT_PLAN_CONSTRAINTS.MIN_MINIMUM_HOURS}` }
                })}
                className="w-full px-3 py-2 bg-[var(--dw-bg-tertiary)] border border-[var(--dw-border-default)] rounded-md text-[var(--dw-text-primary)] focus:border-[var(--dw-accent-primary)] focus:outline-none"
                placeholder="e.g., 1"
              />
            </div>
          </div>
        </div>
      )}

      {/* Fixed Price Fields */}
      {selectedPlanType === 'fixed' && (
        <div className="space-y-4 p-4 bg-[var(--dw-bg-secondary)] rounded-lg border border-[var(--dw-border-subtle)]">
          <h4 className="text-sm font-medium text-[var(--dw-text-primary)]">Fixed Price Configuration</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[var(--dw-text-secondary)] mb-1">Total Amount (KES)</label>
              <input
                type="number"
                {...register('fixedPrice.amount', {
                  required: 'Fixed price is required',
                  min: { value: PAYMENT_PLAN_CONSTRAINTS.MIN_FIXED_PRICE, message: `Minimum is KES ${PAYMENT_PLAN_CONSTRAINTS.MIN_FIXED_PRICE}` }
                })}
                className="w-full px-3 py-2 bg-[var(--dw-bg-tertiary)] border border-[var(--dw-border-default)] rounded-md text-[var(--dw-text-primary)] focus:border-[var(--dw-accent-primary)] focus:outline-none"
                placeholder="e.g., 5000"
              />
              {errors.fixedPrice?.amount && (
                <p className="text-xs text-[var(--dw-color-error)] mt-1">{errors.fixedPrice.amount.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-[var(--dw-text-secondary)] mb-1">Est. Duration (mins)</label>
              <input
                type="number"
                {...register('fixedPrice.estimatedDuration')}
                className="w-full px-3 py-2 bg-[var(--dw-bg-tertiary)] border border-[var(--dw-border-default)] rounded-md text-[var(--dw-text-primary)] focus:border-[var(--dw-accent-primary)] focus:outline-none"
                placeholder="e.g., 120"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="includesMaterials"
              {...register('fixedPrice.includesMaterials')}
              className="w-4 h-4 rounded border-[var(--dw-border-default)] bg-[var(--dw-bg-tertiary)] text-[var(--dw-accent-primary)] focus:ring-[var(--dw-accent-primary)]"
            />
            <label htmlFor="includesMaterials" className="text-sm text-[var(--dw-text-secondary)]">
              Price includes materials
            </label>
          </div>
        </div>
      )}

      {/* Milestone Fields */}
      {selectedPlanType === 'milestone' && (
        <div className="space-y-4 p-4 bg-[var(--dw-bg-secondary)] rounded-lg border border-[var(--dw-border-subtle)]">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-[var(--dw-text-primary)]">Milestones Configuration</h4>
            <button
              type="button"
              onClick={addMilestone}
              disabled={fields.length >= PAYMENT_PLAN_CONSTRAINTS.MAX_MILESTONES}
              className="flex items-center gap-1 text-xs text-[var(--dw-accent-primary)] hover:underline disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> Add Milestone
            </button>
          </div>

          <div>
            <label className="block text-xs text-[var(--dw-text-secondary)] mb-1">Total Project Amount (KES)</label>
            <input
              type="number"
              {...register('totalAmount', {
                required: 'Total amount is required for milestone calculation',
                min: { value: 100, message: 'Minimum is KES 100' }
              })}
              className="w-full px-3 py-2 bg-[var(--dw-bg-tertiary)] border border-[var(--dw-border-default)] rounded-md text-[var(--dw-text-primary)] focus:border-[var(--dw-accent-primary)] focus:outline-none"
              placeholder="e.g., 50000"
            />
            {errors.totalAmount && (
              <p className="text-xs text-[var(--dw-color-error)] mt-1">{errors.totalAmount.message}</p>
            )}
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-3 items-start">
                <div className="flex-1">
                  <input
                    type="text"
                    {...register(`milestones.${index}.name` as const, { required: 'Name is required' })}
                    className="w-full px-3 py-2 bg-[var(--dw-bg-tertiary)] border border-[var(--dw-border-default)] rounded-md text-[var(--dw-text-primary)] text-sm focus:border-[var(--dw-accent-primary)] focus:outline-none"
                    placeholder="Milestone name"
                  />
                </div>
                <div className="w-24">
                  <div className="relative">
                    <input
                      type="number"
                      {...register(`milestones.${index}.percentage` as const, {
                        required: 'Required',
                        min: { value: 0, message: 'Min 0' },
                        max: { value: 100, message: 'Max 100' }
                      })}
                      className="w-full px-3 py-2 pr-8 bg-[var(--dw-bg-tertiary)] border border-[var(--dw-border-default)] rounded-md text-[var(--dw-text-primary)] text-sm focus:border-[var(--dw-accent-primary)] focus:outline-none"
                      placeholder="%"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--dw-text-tertiary)]">%</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeMilestone(index)}
                  disabled={fields.length <= 1}
                  className="p-2 text-[var(--dw-color-error)] hover:bg-[var(--dw-color-error-bg)] rounded-md disabled:opacity-30"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {Math.abs(totalPercentage - 100) < 0.01 ? (
              <CheckCircle className="w-4 h-4 text-[var(--dw-color-success)]" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[var(--dw-color-warning)]" />
            )}
            <span className={`text-xs ${Math.abs(totalPercentage - 100) < 0.01 ? 'text-[var(--dw-color-success)]' : 'text-[var(--dw-color-warning)]'}`}>
              Total: {totalPercentage.toFixed(1)}% (must equal 100%)
            </span>
          </div>
        </div>
      )}

      {/* Per-Project Fields */}
      {selectedPlanType === 'per_project' && (
        <div className="space-y-4 p-4 bg-[var(--dw-bg-secondary)] rounded-lg border border-[var(--dw-border-subtle)]">
          <h4 className="text-sm font-medium text-[var(--dw-text-primary)]">Per-Project Configuration</h4>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="requiresQuote"
              {...register('perProject.requiresQuote')}
              className="w-4 h-4 rounded border-[var(--dw-border-default)] bg-[var(--dw-bg-tertiary)] text-[var(--dw-accent-primary)] focus:ring-[var(--dw-accent-primary)]"
            />
            <label htmlFor="requiresQuote" className="text-sm text-[var(--dw-text-secondary)]">
              Requires custom quote for each project
            </label>
          </div>

          {!watch('perProject.requiresQuote') && (
            <div>
              <label className="block text-xs text-[var(--dw-text-secondary)] mb-1">Base Amount (KES)</label>
              <input
                type="number"
                {...register('perProject.baseAmount', {
                  required: { value: !watch('perProject.requiresQuote'), message: 'Base amount is required' }
                })}
                className="w-full px-3 py-2 bg-[var(--dw-bg-tertiary)] border border-[var(--dw-border-default)] rounded-md text-[var(--dw-text-primary)] focus:border-[var(--dw-accent-primary)] focus:outline-none"
                placeholder="e.g., 10000"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[var(--dw-text-secondary)] mb-1">Est. Min (KES)</label>
              <input
                type="number"
                {...register('perProject.estimatedRange.min')}
                className="w-full px-3 py-2 bg-[var(--dw-bg-tertiary)] border border-[var(--dw-border-default)] rounded-md text-[var(--dw-text-primary)] focus:border-[var(--dw-accent-primary)] focus:outline-none"
                placeholder="e.g., 5000"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--dw-text-secondary)] mb-1">Est. Max (KES)</label>
              <input
                type="number"
                {...register('perProject.estimatedRange.max')}
                className="w-full px-3 py-2 bg-[var(--dw-bg-tertiary)] border border-[var(--dw-border-default)] rounded-md text-[var(--dw-text-primary)] focus:border-[var(--dw-accent-primary)] focus:outline-none"
                placeholder="e.g., 20000"
              />
            </div>
          </div>
        </div>
      )}

      {/* Deposit Settings */}
      <div className="space-y-4 p-4 bg-[var(--dw-bg-secondary)] rounded-lg border border-[var(--dw-border-subtle)]">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-[var(--dw-text-primary)]">Deposit Requirements</h4>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register('deposit.required')}
              className="w-4 h-4 rounded border-[var(--dw-border-default)] bg-[var(--dw-bg-tertiary)] text-[var(--dw-accent-primary)] focus:ring-[var(--dw-accent-primary)]"
            />
            <span className="text-sm text-[var(--dw-text-secondary)]">Require deposit</span>
          </label>
        </div>

        {watch('deposit.required') && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[var(--dw-text-secondary)] mb-1">Deposit %</label>
              <input
                type="number"
                {...register('deposit.percentage', {
                  min: { value: 0, message: 'Min 0%' },
                  max: { value: 100, message: 'Max 100%' }
                })}
                className="w-full px-3 py-2 bg-[var(--dw-bg-tertiary)] border border-[var(--dw-border-default)] rounded-md text-[var(--dw-text-primary)] focus:border-[var(--dw-accent-primary)] focus:outline-none"
                placeholder="e.g., 30"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--dw-text-secondary)] mb-1">Min Amount (KES)</label>
              <input
                type="number"
                {...register('deposit.minimumAmount')}
                className="w-full px-3 py-2 bg-[var(--dw-bg-tertiary)] border border-[var(--dw-border-default)] rounded-md text-[var(--dw-text-primary)] focus:border-[var(--dw-accent-primary)] focus:outline-none"
                placeholder="e.g., 500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Cancellation Policy */}
      <div className="space-y-4 p-4 bg-[var(--dw-bg-secondary)] rounded-lg border border-[var(--dw-border-subtle)]">
        <h4 className="text-sm font-medium text-[var(--dw-text-primary)]">Cancellation Policy</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[var(--dw-text-secondary)] mb-1">Free Cancellation (hours)</label>
            <input
              type="number"
              {...register('cancellationPolicy.freeCancellationHours')}
              className="w-full px-3 py-2 bg-[var(--dw-bg-tertiary)] border border-[var(--dw-border-default)] rounded-md text-[var(--dw-text-primary)] focus:border-[var(--dw-accent-primary)] focus:outline-none"
              placeholder="e.g., 24"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--dw-text-secondary)] mb-1">Cancellation Fee %</label>
            <input
              type="number"
              {...register('cancellationPolicy.cancellationFeePercent', {
                min: { value: 0, message: 'Min 0%' },
                max: { value: 100, message: 'Max 100%' }
              })}
              className="w-full px-3 py-2 bg-[var(--dw-bg-tertiary)] border border-[var(--dw-border-default)] rounded-md text-[var(--dw-text-primary)] focus:border-[var(--dw-accent-primary)] focus:outline-none"
              placeholder="e.g., 20"
            />
          </div>
        </div>
      </div>

      {/* Terms */}
      <div>
        <label className="block text-xs text-[var(--dw-text-secondary)] mb-1">Terms and Conditions</label>
        <textarea
          {...register('terms')}
          rows={3}
          maxLength={PAYMENT_PLAN_CONSTRAINTS.MAX_TERMS_LENGTH}
          className="w-full px-3 py-2 bg-[var(--dw-bg-tertiary)] border border-[var(--dw-border-default)] rounded-md text-[var(--dw-text-primary)] focus:border-[var(--dw-accent-primary)] focus:outline-none resize-none"
          placeholder="Add any specific terms or conditions for this pricing plan..."
        />
      </div>

      {/* Active Status */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          {...register('isActive')}
          className="w-4 h-4 rounded border-[var(--dw-border-default)] bg-[var(--dw-bg-tertiary)] text-[var(--dw-accent-primary)] focus:ring-[var(--dw-accent-primary)]"
        />
        <label htmlFor="isActive" className="text-sm text-[var(--dw-text-secondary)]">
          Activate this plan immediately
        </label>
      </div>

      {/* Error Display */}
      {(submitError || error) && (
        <div className="p-3 bg-[var(--dw-color-error-bg)] border border-[var(--dw-color-error)] rounded-md flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[var(--dw-color-error)]" />
          <span className="text-sm text-[var(--dw-color-error)]">{submitError || error}</span>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t border-[var(--dw-border-subtle)]">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={actionLoading}>
          {existingPlan?._id ? 'Update Plan' : 'Create Plan'}
        </Button>
      </div>
    </form>
  );
};

export default PaymentPlanForm;
