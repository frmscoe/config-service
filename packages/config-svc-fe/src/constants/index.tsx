// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { Icon } from "~/components/common/Icon";


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
  { key: 'NEW', value: '00_NEW' },
  { key: 'DRAFT', value: '01_DRAFT' },
  { key: 'PENDING_REVIEW', value: '10_PENDING_REVIEW' },
  { key: 'REJECTED', value: '11_REJECTED' },
  { key: 'WITHDRAWN', value: '12_WITHDRAWN' },
  { key: 'APPROVED', value: '20_APPROVED' },
  { key: 'DEPLOYED', value: '30_DEPLOYED' },
  { key: 'RETIRED', value: '32_RETIRED' },
  { key: 'ABANDONED', value: '90_ABANDONED' },
  { key: 'ARCHIVED', value: '91_ARCHIVED' },
  // The following are not part of the official machine and should only be included if justified:
  // { key: 'DISABLED', value: '92_DISABLED' },
  // { key: 'MARKED_FOR_DELETION', value: '93_MARKED_FOR_DELETION' },
];


export const RULE_DATA_TYPES = [
  {key: 'currency', value: 'CURRENCY'},
  {key: 'numeric', value: 'NUMERIC'},
  {key: 'time', value: 'TIME'},
  {key: 'calendarDateTime', value: 'CALENDER_DATE_TIME'},
  {key: 'text', value: 'TEXT'}
]


