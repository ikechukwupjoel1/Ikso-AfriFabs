import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface DiscountResult {
    valid: boolean;
    discountType: 'percentage' | 'fixed' | null;
    discountValue: number;
    finalDiscount: number;
    message: string;
}

export function useDiscountCode() {
    const [loading, setLoading] = useState(false);
    const [appliedCode, setAppliedCode] = useState<string | null>(null);
    const [discount, setDiscount] = useState<DiscountResult | null>(null);

    const validateCode = async (code: string, orderAmount: number): Promise<DiscountResult> => {
        setLoading(true);

        try {
            const { data, error } = await supabase.rpc('validate_discount_code', {
                code_text: code.toUpperCase(),
                order_amount: orderAmount
            });

            if (error) throw error;

            const result: DiscountResult = {
                valid: data?.[0]?.valid || false,
                discountType: data?.[0]?.discount_type || null,
                discountValue: data?.[0]?.discount_value || 0,
                finalDiscount: data?.[0]?.final_discount || 0,
                message: data?.[0]?.message || 'Invalid code'
            };

            if (result.valid) {
                setAppliedCode(code.toUpperCase());
                setDiscount(result);
            }

            return result;
        } catch (err) {
            return {
                valid: false,
                discountType: null,
                discountValue: 0,
                finalDiscount: 0,
                message: 'Error validating code'
            };
        } finally {
            setLoading(false);
        }
    };

    const removeCode = () => {
        setAppliedCode(null);
        setDiscount(null);
    };

    const incrementUsage = async (code: string) => {
        await supabase
            .from('discount_codes')
            .update({ times_used: supabase.rpc('increment', { row_id: code }) })
            .eq('code', code.toUpperCase());
    };

    return {
        loading,
        appliedCode,
        discount,
        validateCode,
        removeCode,
        incrementUsage
    };
}
