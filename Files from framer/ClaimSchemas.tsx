import { propertyClaimQuestions } from "./Dynamic_Form_Questions/PropertyClaimQuestions.tsx"
import { alimonyClaimQuestions } from "./Dynamic_Form_Questions/AlimonyClaimQuestions.tsx"
import { custodyClaimQuestions } from "./Dynamic_Form_Questions/CustodyClaimQuestions.tsx"
import { divorceClaimQuestions } from "./Dynamic_Form_Questions/DivorceClaimQuestions.tsx"
import { divorceAgreementQuestions } from "./Dynamic_Form_Questions/DivorceAgreementQuestions.tsx"

export const CLAIM_SCHEMAS = {
    divorceAgreement: divorceAgreementQuestions,
    divorce: divorceClaimQuestions,
    property: propertyClaimQuestions,
    custody: custodyClaimQuestions,
    alimony: alimonyClaimQuestions,
}
