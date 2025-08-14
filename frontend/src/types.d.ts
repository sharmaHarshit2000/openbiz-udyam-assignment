export type ScrapedField = {
  tag?: string;
  type?: string | null;
  name?: string | null;
  id?: string | null;
  placeholder?: string | null;
  label?: string | null;
  attributes?: Record<string, string>;
  validationRules?: {
    required?: boolean;
    pattern?: string | null;
    minLength?: number | null;
    maxLength?: number | null;
  };
  validationMessage?: string | null; 
};

export type ScrapedStep = {
  title?: string;
  url?: string;
  inputs: ScrapedField[];
};
