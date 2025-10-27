import { propertyClaimQuestions } from "./Dynamic Form Questions/PropertyClaimQuestions"
import { alimonyClaimQuestions } from "./Dynamic Form Questions/AlimonyClaimQuestions"
import { custodyClaimQuestions } from "./Dynamic Form Questions/CustodyClaimQuestions"
import { divorceClaimQuestions } from "./Dynamic Form Questions/DivorceClaimQuestions"
import { divorceAgreementQuestions } from "./Dynamic Form Questions/DivorceAgreementQuestions"

export const CLAIM_SCHEMAS = {
    divorceAgreement: divorceAgreementQuestions,
    divorce: divorceClaimQuestions,
    property: propertyClaimQuestions,
    custody: custodyClaimQuestions,
    alimony: alimonyClaimQuestions,
}
