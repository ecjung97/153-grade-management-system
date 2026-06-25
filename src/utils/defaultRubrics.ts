import type { RubricCriteria } from '../types';

export const EXCEL_PRACTICAL_RUBRIC: RubricCriteria[] = [
  {
    id: 'crit-1',
    name: '데이터 입력',
    levels: [
      { label: '상', score: 3, description: '제시된 쇼핑 리스트의 상품명, 가격, 수량을 오타 없이 엑셀 표에 정확하게 입력함.' },
      { label: '중', score: 2, description: '데이터를 대부분 입력했으나 일부 오타가 있거나 행/열 위치가 약간 어긋남.' },
      { label: '하', score: 1, description: '데이터 입력 자체에 어려움을 겪어 교사나 친구의 지속적인 도움이 필요함.' }
    ]
  },
  {
    id: 'crit-2',
    name: '수식 활용 (곱셈)',
    levels: [
      { label: '상', score: 3, description: "'='와 '*'를 사용하여 '총 금액'을 구하는 수식을 4개 항목 모두에 정확히 적용함." },
      { label: '중', score: 2, description: '수식을 시도했으나 기호(=, *) 사용에 실수가 있거나 일부 항목만 계산함.' },
      { label: '하', score: 1, description: '수식의 원리를 이해하지 못해 암산으로 적거나 빈칸으로 제출함.' }
    ]
  },
  {
    id: 'crit-3',
    name: '함수 활용 (SUM)',
    levels: [
      { label: '상', score: 3, description: '자동 합계(SUM) 기능을 올바른 범위에 적용하여 전체 총합계를 정확히 계산함.' },
      { label: '중', score: 2, description: '자동 합계 기능을 사용했으나 범위를 잘못 지정하여 엉뚱한 합계가 나옴.' },
      { label: '하', score: 1, description: '자동 합계 메뉴를 찾지 못하거나 어떻게 적용하는지 모름.' }
    ]
  },
  {
    id: 'crit-4',
    name: '결과 도출 (정답)',
    levels: [
      { label: '상', score: 3, description: "계산된 결과를 바탕으로 총 금액(52,500원)을 정확히 적고, '예산 초과'를 올바르게 판별함." },
      { label: '중', score: 2, description: '총 금액 수치는 적었으나 예산 초과 여부 판별을 실수하거나, 계산 실수로 오답을 적음.' },
      { label: '하', score: 1, description: '엑셀 계산 결과를 제대로 해석하지 못해 최종 정답란을 채우지 못함.' }
    ]
  }
];
