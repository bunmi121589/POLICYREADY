// catalog.js — single source of truth for what can be purchased and delivered.
//
// Every manual is a flat $200. Stripe does NOT need a product/price created for
// each one: the checkout function builds a $200 line item on the fly and stores
// the manual's `slug` in the session metadata. This file maps that slug to the
// display title (shown on the Stripe checkout page) and the file to deliver
// (the .docx must sit in api/_files/ with the exact name below).
//
// >>> THE ONE INTEGRATION SEAM <<<
// The `slug` values below MUST match the slugs your site already uses in data.js
// and in your product/state detail URLs. Keep this file as the source of truth
// and make data.js use the same slugs, OR replace PRODUCTS by importing data.js.
// Everything else in this integration reads through getProduct().

const PRICE_CENTS = 20000; // $200.00 — flat price for every manual
const CURRENCY = "usd";

// slug: { title (shown at checkout), file (delivered .docx in api/_files/) }
const PRODUCTS = {
  // ===== Host Home / IDD Residential line (original) =====
  'co-individual': { title: 'Policy & Procedure Manual for Host Home Provider (Colorado)', file: 'CO_Individual_Provider_JC_FINAL.docx' },
  'co-agency': { title: 'Policy & Procedure Manual for Host Home Provider Agency (Colorado)', file: 'CO_Agency_PASA_JC_FINAL.docx' },
  'az-individual': { title: 'Policy & Procedure Manual for Developmental Home Provider (Arizona)', file: 'AZ_Individual_Provider_JC_FINAL.docx' },
  'az-agency': { title: 'Policy & Procedure Manual for Developmental Home Provider Agency (Arizona)', file: 'AZ_Agency_QualifiedVendor_JC_FINAL.docx' },
  'fl-individual': { title: 'Policy & Procedure Manual for Foster Care Facility Operator (Florida)', file: 'FL_Individual_Operator_JC_FINAL.docx' },
  'fl-agency': { title: 'Policy & Procedure Manual for Foster Care Facility Agency (Florida)', file: 'FL_Agency_LicensedProvider_JC_FINAL.docx' },
  'tx-individual': { title: 'Policy & Procedure Manual for Host Home/Companion Care Provider (Texas)', file: 'TX_Individual_HH_CC_Provider_JC_FINAL.docx' },
  'tx-agency': { title: 'Policy & Procedure Manual for HCS Program Provider (Texas)', file: 'TX_Program_Provider_JC_FINAL.docx' },
  'nm-individual': { title: 'Policy & Procedure Manual for Family Living Provider (New Mexico)', file: 'NM_Individual_FamilyLiving_Provider_JC_FINAL.docx' },
  'nm-agency': { title: 'Policy & Procedure Manual for DDW Family Living Provider Agency (New Mexico)', file: 'NM_Provider_Agency_JC_FINAL.docx' },
  'ga-individual': { title: 'Policy & Procedure Manual for Host Home/Life-Sharing Provider (Georgia)', file: 'GA_Individual_HostHome_Provider_JC_FINAL.docx' },
  'ga-agency': { title: 'Policy & Procedure Manual for CRA Provider Agency (Georgia)', file: 'GA_Agency_CRA_Provider_JC_FINAL.docx' },
  'ca-individual': { title: 'Policy & Procedure Manual for Family Home Provider - FHA (California)', file: 'CA_Individual_FamilyHome_Provider_JC_FINAL.docx' },
  'ca-agency': { title: 'Policy & Procedure Manual for Family Home Agency - FHA (California)', file: 'CA_FamilyHomeAgency_JC_FINAL.docx' },
  'oh-individual': { title: 'Policy & Procedure Manual for Shared Living Independent Provider (Ohio)', file: 'OH_Individual_SharedLiving_Provider_JC_FINAL.docx' },
  'oh-agency': { title: 'Policy & Procedure Manual for Shared Living Agency Provider (Ohio)', file: 'OH_Agency_SharedLiving_Provider_JC_FINAL.docx' },
  'tn-individual': { title: 'Policy & Procedure Manual for Family Model Residential (Host Home) Provider (Tennessee)', file: 'TN_Individual_HostHome_PP_Manual.docx' },
  'tn-agency': { title: 'Policy & Procedure Manual for Family Model Residential (Host Home) Provider Agency (Tennessee)', file: 'TN_Agency_HostHome_PP_Manual.docx' },
  'va-individual': { title: 'Policy & Procedure Manual for Sponsored Residential Provider (Virginia)', file: 'VA_Individual_HostHome_PP_Manual.docx' },
  'va-agency': { title: 'Policy & Procedure Manual for Sponsored Residential Provider Agency (Virginia)', file: 'VA_Agency_HostHome_PP_Manual.docx' },
  'sc-individual': { title: 'Policy & Procedure Manual for Community Training Home (CTH-I) Host-Family Provider (South Carolina)', file: 'SC_Individual_HostHome_PP_Manual.docx' },
  'sc-agency': { title: 'Policy & Procedure Manual for Community Training Home / Residential Habilitation Provider Agency (South Carolina)', file: 'SC_Agency_HostHome_PP_Manual.docx' },
  'wi-individual': { title: 'Policy & Procedure Manual for Certified 1-2 Bed Adult Family Home Operator (Wisconsin)', file: 'WI_Individual_HostHome_PP_Manual.docx' },
  'wi-agency': { title: 'Policy & Procedure Manual for 1-2 Bed Adult Family Home Provider Agency (Wisconsin)', file: 'WI_Agency_HostHome_PP_Manual.docx' },

  // ===== Behavioral Health — Substance Use (SUD) line =====
  "co-bhe": { title: "Colorado Behavioral Health Entity (BHE) Base Policy & Procedure Manual", file: "CO Behavioral Health Entity (BHE) Base PP Manual.docx" },
  "co-bhe-outpatient-addon": { title: "Colorado BHE Outpatient Endorsement Add-On", file: "CO BHE Outpatient Endorsement Add-On.docx" },
  "co-bhe-residential-addon": { title: "Colorado BHE Residential & Withdrawal Management Endorsement Add-On", file: "CO BHE Residential & Withdrawal Management Endorsement Add-On.docx" },
  "co-bhe-crisis-addon": { title: "Colorado BHE Emergency & Crisis Services Endorsement Add-On", file: "CO BHE Emergency & Crisis Services Endorsement Add-On.docx" },
  "az-bhrf": { title: "Arizona Behavioral Health Residential Facility (BHRF) Policy & Procedure Manual", file: "AZ Behavioral Health Residential Facility (BHRF) PP Manual.docx" },
  "az-otc": { title: "Arizona Outpatient Treatment Center (OTC) Policy & Procedure Manual", file: "AZ Outpatient Treatment Center (OTC) PP Manual.docx" },
  "fl-sud": { title: "Florida Substance Abuse Services (DCF 65D-30) Policy & Procedure Manual", file: "FL Substance Abuse Services (DCF 65D-30) PP Manual.docx" },
  "tx-sud": { title: "Texas Chemical Dependency Treatment Facility (26 TAC 564) Policy & Procedure Manual", file: "TX Chemical Dependency Treatment Facility (26 TAC 564) PP Manual.docx" },
  "nm-bha": { title: "New Mexico Behavioral Health Agency (Substance Use & Mental Health) Policy & Procedure Manual", file: "NM Behavioral Health Agency (Substance Use & Mental Health) PP Manual.docx" },
  "ga-sud": { title: "Georgia Drug Abuse Treatment & Education Program (111-8-19) Policy & Procedure Manual", file: "GA Drug Abuse Treatment & Education Program (111-8-19) PP Manual.docx" },
  "ca-sud": { title: "California Residential AOD Recovery or Treatment Facility (Title 9 Ch5) Policy & Procedure Manual", file: "CA Residential AOD Recovery or Treatment Facility (Title 9 Ch5) PP Manual.docx" },
  "oh-bh": { title: "Ohio Behavioral Health Provider (OhioMHAS) Policy & Procedure Manual", file: "OH Behavioral Health Provider (OhioMHAS) PP Manual.docx" },
  "wi-sud": { title: "Wisconsin Community Substance Use Service (DHS 75) Policy & Procedure Manual", file: "WI Community Substance Use Service (DHS 75) PP Manual.docx" },
  "ar-sud": { title: "Arkansas Alcohol & Other Drug Abuse Treatment Program (OADAP Part 433) Policy & Procedure Manual", file: "AR Alcohol & Other Drug Abuse Treatment Program (OADAP Part 433) PP Manual.docx" },
  "tn-sud": { title: "Tennessee Alcohol & Drug Treatment Facility (TDMHSAS 0940-05) Policy & Procedure Manual", file: "TN Alcohol & Drug Treatment Facility (TDMHSAS 0940-05) PP Manual.docx" },
  "sc-sud": { title: "South Carolina Facility Treating Psychoactive Substance Abuse or Dependence (R.61-93) Policy & Procedure Manual", file: "SC Facility Treating Psychoactive Substance Abuse or Dependence (R.61-93) PP Manual.docx" },
  "va-sud": { title: "Virginia Substance Use Disorder Provider (DBHDS 12VAC35-105) Policy & Procedure Manual", file: "VA Substance Use Disorder Provider (DBHDS 12VAC35-105) PP Manual.docx" },

  // ===== Mental Health (MH) line =====
  "fl-mh": { title: "Florida Mental Health Residential Treatment Facility (AHCA 65E-4.016) Policy & Procedure Manual", file: "FL Mental Health Residential Treatment Facility (AHCA 65E-4.016) PP Manual.docx" },
  "tx-mh": { title: "Texas Private Psychiatric Hospital & Crisis Stabilization Unit (26 TAC 510) Policy & Procedure Manual", file: "TX Private Psychiatric Hospital & Crisis Stabilization Unit (26 TAC 510) PP Manual.docx" },
  "ga-mh": { title: "Georgia Adult Residential Mental Health Program (111-8-2) Policy & Procedure Manual", file: "GA Adult Residential Mental Health Program (111-8-2) PP Manual.docx" },
  "wi-mh": { title: "Wisconsin Outpatient Mental Health Clinic (DHS 35) Policy & Procedure Manual", file: "WI Outpatient Mental Health Clinic (DHS 35) PP Manual.docx" },
  "ar-mh": { title: "Arkansas Behavioral Health Agency (Outpatient Behavioral Health Services) Policy & Procedure Manual", file: "AR Behavioral Health Agency (Outpatient Behavioral Health Services) PP Manual.docx" },
  "tn-mh": { title: "Tennessee Mental Health Adult Residential Treatment Program (0940-05-17) Policy & Procedure Manual", file: "TN Mental Health Adult Residential Treatment Program (0940-05-17) PP Manual.docx" },
  "ca-mh": { title: "California Mental Health Rehabilitation Center (Title 9 Ch 3.5) Policy & Procedure Manual", file: "CA Mental Health Rehabilitation Center (Title 9 Ch 3.5) PP Manual.docx" },
  "sc-mh": { title: "South Carolina Residential Treatment Facility for Children & Adolescents (R.60-103) Policy & Procedure Manual", file: "SC Residential Treatment Facility for Children & Adolescents (R.60-103) PP Manual.docx" },

  // ===== Assisted Living / Residential Care line =====
  "az-al-personal-care": { title: "Arizona Assisted Living Personal Care Policy & Procedure Manual", file: "AZ Assisted Living Personal Care PP Manual.docx" },
  "az-al-directed-care": { title: "Arizona Assisted Living Directed Care Policy & Procedure Manual", file: "AZ Assisted Living Directed Care PP Manual.docx" },
  "az-al-supervisory-care": { title: "Arizona Assisted Living Supervisory Care Policy & Procedure Manual", file: "AZ Assisted Living Supervisory Care PP Manual.docx" },
  "ar-alf-level-1": { title: "Arkansas Assisted Living Facility Level I Policy & Procedure Manual", file: "AR Assisted Living Facility Level I PP Manual.docx" },
  "ar-alf-level-2": { title: "Arkansas Assisted Living Facility Level II Policy & Procedure Manual", file: "AR Assisted Living Facility Level II PP Manual.docx" },
  "ca-rcfe": { title: "California Residential Care Facility for the Elderly (RCFE) Policy & Procedure Manual", file: "CA Residential Care Facility for the Elderly (RCFE) PP Manual.docx" },
  "co-alr": { title: "Colorado Assisted Living Residence Policy & Procedure Manual", file: "CO Assisted Living Residence PP Manual.docx" },
  "fl-al-standard": { title: "Florida Assisted Living Standard License Policy & Procedure Manual", file: "FL Assisted Living Standard License PP Manual.docx" },
  "fl-al-ecc-addon": { title: "Florida Assisted Living ECC Add-On", file: "FL Assisted Living ECC Add-On.docx" },
  "fl-al-lmh-addon": { title: "Florida Assisted Living LMH Add-On", file: "FL Assisted Living LMH Add-On.docx" },
  "fl-al-lns-addon": { title: "Florida Assisted Living LNS Add-On", file: "FL Assisted Living LNS Add-On.docx" },
  "ga-alc": { title: "Georgia Assisted Living Community (ALC) Policy & Procedure Manual", file: "GA Assisted Living Community (ALC) PP Manual.docx" },
  "ga-pch": { title: "Georgia Personal Care Home (PCH) Policy & Procedure Manual", file: "GA Personal Care Home (PCH) PP Manual.docx" },
  "nm-al": { title: "New Mexico Assisted Living Policy & Procedure Manual", file: "NM Assisted Living PP Manual.docx" },
  "oh-rcf": { title: "Ohio Residential Care Facility (RCF) Policy & Procedure Manual", file: "OH Residential Care Facility (RCF) PP Manual.docx" },
  "sc-crcf": { title: "South Carolina Community Residential Care Facility (CRCF) Policy & Procedure Manual", file: "SC Community Residential Care Facility (CRCF) PP Manual.docx" },
  "tn-aclf": { title: "Tennessee Assisted-Care Living Facility (ACLF) Policy & Procedure Manual", file: "TN Assisted-Care Living Facility (ACLF) PP Manual.docx" },
  "tn-rha": { title: "Tennessee Residential Home for the Aged (RHA) Policy & Procedure Manual", file: "TN Residential Home for the Aged (RHA) PP Manual.docx" },
  "tx-al-type-ab": { title: "Texas Assisted Living Type A and B Policy & Procedure Manual", file: "TX Assisted Living Type A and B PP Manual.docx" },
  "va-alf": { title: "Virginia Assisted Living Facility (ALF) Policy & Procedure Manual", file: "VA Assisted Living Facility (ALF) PP Manual.docx" },
  "wi-cbrf": { title: "Wisconsin Community-Based Residential Facility (CBRF) Policy & Procedure Manual", file: "WI Community-Based Residential Facility (CBRF) PP Manual.docx" },
  "wi-afh": { title: "Wisconsin Licensed Adult Family Home (AFH 3-4 Bed) Policy & Procedure Manual", file: "WI Licensed Adult Family Home (AFH 3-4 Bed) PP Manual.docx" },
  "wi-rcac": { title: "Wisconsin Residential Care Apartment Complex (RCAC) Policy & Procedure Manual", file: "WI Residential Care Apartment Complex (RCAC) PP Manual.docx" },

  // ===== Employee Handbook line =====
  "ar-al-handbook": { title: "Arkansas Assisted Living Employee Handbook", file: "AR Assisted Living Employee Handbook.docx" },
  "az-al-handbook": { title: "Arizona Assisted Living Employee Handbook", file: "AZ Assisted Living Employee Handbook.docx" },
  "ca-rcfe-handbook": { title: "California RCFE Employee Handbook", file: "CA RCFE Employee Handbook.docx" },
  "co-al-handbook": { title: "Colorado Assisted Living Employee Handbook", file: "CO Assisted Living Employee Handbook.docx" },
  "fl-al-handbook": { title: "Florida Assisted Living Employee Handbook", file: "FL Assisted Living Employee Handbook.docx" },
  "ga-al-handbook": { title: "Georgia Assisted Living Employee Handbook", file: "GA Assisted Living Employee Handbook.docx" },
  "nm-al-handbook": { title: "New Mexico Assisted Living Employee Handbook", file: "NM Assisted Living Employee Handbook.docx" },
  "oh-rcf-handbook": { title: "Ohio Residential Care Facility Employee Handbook", file: "OH Residential Care Facility Employee Handbook.docx" },
  "sc-crcf-handbook": { title: "South Carolina Community Residential Care Facility Employee Handbook", file: "SC Community Residential Care Facility Employee Handbook.docx" },
  "tn-aclf-handbook": { title: "Tennessee Assisted-Care Living Facility Employee Handbook", file: "TN Assisted-Care Living Facility Employee Handbook.docx" },
  "tx-al-handbook": { title: "Texas Assisted Living Employee Handbook", file: "TX Assisted Living Employee Handbook.docx" },
  "va-al-handbook": { title: "Virginia Assisted Living Employee Handbook", file: "VA Assisted Living Employee Handbook.docx" },
  "wi-cbrf-handbook": { title: "Wisconsin Community-Based Residential Facility Employee Handbook", file: "WI Community-Based Residential Facility Employee Handbook.docx" },
  // ===== Care Provider Employee Handbook line =====
  "ar-care-handbook": { title: "Arkansas Care Provider Employee Handbook", file: "AR_Care_Provider_Employee_Handbook.docx" },
  "az-care-handbook": { title: "Arizona Care Provider Employee Handbook", file: "AZ_Care_Provider_Employee_Handbook.docx" },
  "ca-care-handbook": { title: "California Care Provider Employee Handbook", file: "CA_Care_Provider_Employee_Handbook.docx" },
  "co-care-handbook": { title: "Colorado Care Provider Employee Handbook", file: "CO_Care_Provider_Employee_Handbook.docx" },
  "fl-care-handbook": { title: "Florida Care Provider Employee Handbook", file: "FL_Care_Provider_Employee_Handbook.docx" },
  "ga-care-handbook": { title: "Georgia Care Provider Employee Handbook", file: "GA_Care_Provider_Employee_Handbook.docx" },
  "nm-care-handbook": { title: "New Mexico Care Provider Employee Handbook", file: "NM_Care_Provider_Employee_Handbook.docx" },
  "oh-care-handbook": { title: "Ohio Care Provider Employee Handbook", file: "OH_Care_Provider_Employee_Handbook.docx" },
  "sc-care-handbook": { title: "South Carolina Care Provider Employee Handbook", file: "SC_Care_Provider_Employee_Handbook.docx" },
  "tn-care-handbook": { title: "Tennessee Care Provider Employee Handbook", file: "TN_Care_Provider_Employee_Handbook.docx" },
  "tx-care-handbook": { title: "Texas Care Provider Employee Handbook", file: "TX_Care_Provider_Employee_Handbook.docx" },
  "va-care-handbook": { title: "Virginia Care Provider Employee Handbook", file: "VA_Care_Provider_Employee_Handbook.docx" },
  "wi-care-handbook": { title: "Wisconsin Care Provider Employee Handbook", file: "WI_Care_Provider_Employee_Handbook.docx" },

  // ===== How-To / Business Startup Guides =====
  "co-open-host-home": { title: "How to Open a Host Home Business in Colorado", file: "How_to_Open_a_Host_Home_Business_in_Colorado.pdf" },
  "az-open-dev-home": { title: "How to Open a Developmental Home Business in Arizona", file: "How_to_Open_a_Developmental_Home_Business_in_Arizona.pdf" },
  "tx-open-host-home": { title: "How to Open a Host Home Business in Texas", file: "How_to_Open_a_Host_Home_Business_in_Texas.pdf" },
  "fl-open-group-home": { title: "How to Open a Group Home Business in Florida", file: "How_to_Open_a_Group_Home_Business_in_Florida.pdf" },
  "oh-open-shared-living": { title: "How to Open a Shared Living (Host Home) Business in Ohio", file: "How_to_Open_a_Shared_Living_Business_in_Ohio.pdf" },
  "ca-open-group-home": { title: "How to Open a Group Home Business in California", file: "How_to_Open_a_Group_Home_Business_in_California.pdf" },
  "ga-open-group-home": { title: "How to Open a Group Home Business in Georgia", file: "How_to_Open_a_Group_Home_Business_in_Georgia.pdf" },
  "nm-open-group-home": { title: "How to Open a Group Home Business in New Mexico", file: "How_to_Open_a_Group_Home_Business_in_New_Mexico.pdf" },
  "tn-open-group-home": { title: "How to Open a Group Home Business in Tennessee", file: "How_to_Open_a_Group_Home_Business_in_Tennessee.pdf" },
  "sc-open-group-home": { title: "How to Open a Group Home Business in South Carolina", file: "How_to_Open_a_Group_Home_Business_in_South_Carolina.pdf" },
  "wi-open-group-home": { title: "How to Open a Group Home Business in Wisconsin", file: "How_to_Open_a_Group_Home_Business_in_Wisconsin.pdf" },
};

function getProduct(slug) {
  if (!slug || typeof slug !== "string") return null;
  return PRODUCTS[slug] || null;
}

module.exports = { PRODUCTS, PRICE_CENTS, CURRENCY, getProduct };
