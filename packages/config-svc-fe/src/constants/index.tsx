import { Icon } from "~/components/common/Icon";

export const exitConditions = [
  {
    subRuleRef: ".x00",
    reason: ".x00 No verifiable creditor account activity detected",
  },
  {
    subRuleRef: ".x01",
    reason: ".x01 No verifiable creditor account activity detected",
  },
  {
    subRuleRef: ".x03",
    reason: ".x03 No verifiable creditor account activity detected",
  },
  {
    subRuleRef: ".x04",
    reason: ".x04 No verifiable creditor account activity detected",
  },
];

export const languages = [
  {
    label: "English",
    value: "en",
    icon: <Icon name="united-kingdom" width="1.45rem" />,
  },
  {
    label: "German",
    value: "de",
    icon: <Icon name="germany" width="1.45rem" />,
  },
  {
    label: "France",
    value: "fr",
    icon: <Icon name="france" width="1.25rem" />,
  },

  {
    label: "Spain",
    value: "es",
    icon: <Icon name="spain" width="1.25rem" />,
  },
];

export const RULE_STATES = [
  { key: 'DRAFT', value: '01_DRAFT' },
  { key: 'PENDING_REVIEW', value: '10_PENDING_REVIEW' },
  { key: 'REJECTED', value: '11_REJECTED' },
  { key: 'WITHDRAWN', value: '12_WITHDRAWN' },
  { key: 'APPROVED', value: '20_APPROVED' },
  { key: 'DEPLOYED', value: '30_DEPLOYED' },
  { key: 'RETIRED', value: '32_RETIRED' },
  { key: 'ABANDONED', value: '90_ABANDONED' },
  { key: 'ARCHIVED', value: '91_ARCHIVED' },
  { key: 'DISABLED', value: '92_DISABLED' },
  { key: 'MARKED_FOR_DELETION', value: '93_MARKED_FOR_DELETION' }
];

export const RULE_DATA_TYPES = [
  {key: 'currency', value: 'CURRENCY'},
  {key: 'numeric', value: 'NUMERIC'},
  {key: 'time', value: 'TIME'},
  {key: 'calendarDateTime', value: 'CALENDER_DATE_TIME'},
  {key: 'text', value: 'TEXT'}
]

export const DEFAULT_EXIT_CONDITIONS = [{
  subRefRule: '.x00',
  reason: 'Unsuccessful transaction',
  description: 'This condition applies to rule processors that rely on the current transaction being successful in order for the rule to produce a meaningful result. Unsuccessful transactions are often not processed to spare system resources or because the unsuccessful transaction means that the rule processor is unable to function as designed.',
},

{
  subRefRule: '.x01',
  reason: 'Insufficient transaction history. At least 50 historical transactions are required',
  description : 'For certain rules, a specific minimum number of historical transactions are required for the rule processor to produce an effective result. This exit condition will be reported if the minimum number of historical records cannot be retrieved in the rule processor.'
},

{
  reason: 'No variance in transaction history and the volume of recent incoming transactions shows an increase',
  subRefRule: '.x03',
  description: 'The statistical analyses employed in some rule processors evaluate trends in behaviour over a number of transactions over a period of time. While the trend itself can be categorized and reported by the regular rule results, some results are not part of an automatable scaled result. This exception provides an outcome when the historical period does not show a clear trend, but the most recent period shows an upturn.'
},
{
  reason: 'No variance in transaction history and the volume of recent incoming transactions is less than or equal to the historical average',
  subRefRule:'.x04',
  description: 'Similar to .x03, but this exception provides an outcome when the historical period does not show a clear trend, but the most recent period shows an downturn.'
}

]
