import * as Yup from 'yup';

export const projectValidationSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .min(2, 'Track title must be at least 2 characters')
    .required('Track title is required'),
  selectedGenre: Yup.string().required('Please select a genre'),
  customGenre: Yup.string().when('selectedGenre', {
    is: 'Custom',
    then: (schema) => schema.trim().required('Please specify custom genre'),
    otherwise: (schema) => schema.optional(),
  }),
  currentStage: Yup.string().required('Workflow stage is required'),
  bpm: Yup.number()
    .typeError('BPM must be a valid number')
    .positive('BPM must be greater than 0')
    .integer('BPM must be an integer')
    .min(30, 'BPM must be at least 30')
    .max(300, 'BPM cannot exceed 300')
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
  keySignature: Yup.string().optional(),
  releaseDate: Yup.string()
    .required('Target release date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  description: Yup.string().optional(),
});
