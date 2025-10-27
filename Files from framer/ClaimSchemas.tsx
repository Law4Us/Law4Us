import { propertyClaimQuestions } from "./Dynamic Form Questions/PropertyClaimQuestions.tsx"
import { alimonyClaimQuestions } from "./Dynamic Form Questions/AlimonyClaimQuestions.tsx"
import { custodyClaimQuestions } from "./Dynamic Form Questions/CustodyClaimQuestions.tsx"
import { divorceClaimQuestions } from "./Dynamic Form Questions/DivorceClaimQuestions.tsx"
import { divorceAgreementQuestions } from "./Dynamic Form Questions/DivorceAgreementQuestions.tsx"

export const CLAIM_SCHEMAS = {
    divorceAgreement: divorceAgreementQuestions,
    divorce: divorceClaimQuestions,
    property: propertyClaimQuestions,
    custody: custodyClaimQuestions,
    alimony: alimonyClaimQuestions,
}
