import { integer, pick, seededRandom, shuffle } from './random'
import type { AnswerOption, Difficulty, Exercise, ExerciseStep, SkillId } from './types'

export const SKILL_LABELS: Record<SkillId, string> = {
  addition: 'Plusaufgaben',
  subtraction: 'Minusaufgaben',
  multiplication: 'Einmaleins',
  division: 'Umkehraufgaben',
  'place-value': 'Stellenwerte',
  decompose: 'Zahlen zerlegen',
  compose: 'Zahlen bauen',
  'neighbor-tens': 'Nachbarzehner',
  'neighbor-hundreds': 'Nachbarhunderter',
  'round-tens': 'Auf Zehner runden',
  'round-hundreds': 'Auf Hunderter runden',
  'word-problem': 'Sachaufgabe',
  symmetry: 'Spiegelbilder'
}

const base = (skillId: SkillId, seed: number, difficulty: Difficulty, values: Record<string, number | string>) => ({
  id: `${skillId}-${seed}`,
  skillId,
  difficulty,
  title: SKILL_LABELS[skillId],
  variant: { seed, key: `${skillId}:${JSON.stringify(values)}`, values },
  testMetadata: { min: 0, max: 1000, uniqueSolution: true as const }
})

function numberOptions(random: () => number, correct: number, candidates: number[]): AnswerOption[] {
  const values = [...new Set([correct, ...candidates.filter((value) => value >= 0 && value <= 1000)])]
  let offset = 1
  while (values.length < 3) {
    if (!values.includes(correct + offset)) values.push(correct + offset)
    offset += 1
  }
  return shuffle(random, values.slice(0, 3)).map((value) => ({ value: String(value), label: String(value) }))
}

function textOptions(random: () => number, correct: string, distractors: string[]): AnswerOption[] {
  return shuffle(random, [...new Set([correct, ...distractors])].slice(0, 3)).map((value) => ({ value, label: value }))
}

function addition(seed: number, difficulty: Difficulty): Exercise {
  const random = seededRandom(seed)
  const first = integer(random, 2, difficulty === 1 ? 9 : 13)
  const second = integer(random, 1, Math.min(20 - first, difficulty === 1 ? 9 : 12))
  const answer = first + second
  const values = { first, second, answer }
  return {
    ...base('addition', seed, difficulty, values),
    typeId: 'addition-to-20',
    prompt: `Wie viel ist ${first} + ${second}?`,
    answerMode: 'number',
    correctAnswer: String(answer),
    hints: [
      { level: 1, text: `Starte bei ${first} und zähle ${second} weiter.` },
      { level: 2, text: `Zerlege ${second}, sodass du zuerst bis 10 oder zur nächsten vollen Zahl kommst.` }
    ],
    errorFeedback: `Fast. Prüfe noch einmal, wie viele Schritte du von ${first} weiterzählst.`,
    explanation: `${first} plus ${second} sind ${answer}. Du kannst die zweite Zahl in kleine Schritte zerlegen.`
  }
}

function subtraction(seed: number, difficulty: Difficulty): Exercise {
  const random = seededRandom(seed)
  const first = integer(random, difficulty === 1 ? 8 : 12, 20)
  const second = integer(random, 1, Math.min(first, difficulty === 1 ? 8 : 12))
  const answer = first - second
  const values = { first, second, answer }
  return {
    ...base('subtraction', seed, difficulty, values),
    typeId: 'subtraction-to-20',
    prompt: `Wie viel ist ${first} − ${second}?`,
    answerMode: 'number',
    correctAnswer: String(answer),
    hints: [
      { level: 1, text: `Gehe von ${first} aus ${second} Schritte zurück.` },
      { level: 2, text: `Du kannst erst bis 10 zurückgehen und dann den Rest abziehen.` }
    ],
    errorFeedback: `Noch nicht ganz. Beim Minusrechnen wird die Zahl kleiner.`,
    explanation: `Von ${first} gehen ${second} weg. Übrig bleiben ${answer}.`
  }
}

function multiplication(seed: number, difficulty: Difficulty): Exercise {
  const random = seededRandom(seed)
  const maxFactor = difficulty === 1 ? 5 : 10
  const first = integer(random, 2, maxFactor)
  const second = integer(random, 2, 10)
  const answer = first * second
  const values = { first, second, answer }
  return {
    ...base('multiplication', seed, difficulty, values),
    typeId: 'small-multiplication',
    prompt: `Wie viel ist ${first} · ${second}?`,
    answerMode: 'number',
    correctAnswer: String(answer),
    hints: [
      { level: 1, text: `${first} · ${second} bedeutet: ${second} wird ${first}-mal genommen.` },
      { level: 2, text: `Rechne schrittweise: ${Array.from({ length: first }, () => second).join(' + ')}.` }
    ],
    errorFeedback: `Schau noch einmal auf die ${first} gleich großen Gruppen.`,
    explanation: `${first} Gruppen mit je ${second} sind zusammen ${answer}.`
  }
}

function division(seed: number, difficulty: Difficulty): Exercise {
  const random = seededRandom(seed)
  const divisor = integer(random, 2, difficulty === 1 ? 5 : 10)
  const quotient = integer(random, 2, 10)
  const dividend = divisor * quotient
  const values = { dividend, divisor, quotient }
  return {
    ...base('division', seed, difficulty, values),
    typeId: 'inverse-division',
    prompt: `${dividend} : ${divisor} = ?`,
    answerMode: 'number',
    correctAnswer: String(quotient),
    hints: [
      { level: 1, text: `Welche Zahl mal ${divisor} ergibt ${dividend}?` },
      { level: 2, text: `Nutze die Umkehraufgabe: ${divisor} · ? = ${dividend}.` }
    ],
    errorFeedback: `Die Gruppen müssen gleich groß sein. Nutze die passende Malaufgabe.`,
    explanation: `${divisor} · ${quotient} = ${dividend}. Deshalb ist ${dividend} : ${divisor} = ${quotient}.`
  }
}

function placeValue(seed: number, difficulty: Difficulty): Exercise {
  const random = seededRandom(seed)
  const hundreds = integer(random, 1, 9)
  const tens = integer(random, 0, 9)
  const ones = integer(random, 0, 9)
  const number = hundreds * 100 + tens * 10 + ones
  const position = pick(random, ['Hunderter', 'Zehner', 'Einer'] as const)
  const digit = position === 'Hunderter' ? hundreds : position === 'Zehner' ? tens : ones
  const answer = position === 'Hunderter' ? digit * 100 : position === 'Zehner' ? digit * 10 : digit
  const values = { number, position, digit, answer }
  return {
    ...base('place-value', seed, difficulty, values),
    typeId: 'digit-place-value',
    prompt: `Welchen Wert hat die Ziffer ${digit} bei den ${position}n in ${number}?`,
    answerMode: 'choice',
    correctAnswer: String(answer),
    options: numberOptions(random, answer, [digit, digit * 10, digit * 100]),
    hints: [
      { level: 1, text: `Suche die ${position}-Spalte.` },
      { level: 2, text: `${digit} ${position} bedeuten nicht nur die Ziffer ${digit}, sondern ihren Wert an dieser Stelle.` }
    ],
    errorFeedback: `Ziffer und Stellenwert sind verschieden. Achte auf die Spalte der ${position}.`,
    explanation: `In ${number} steht die ${digit} bei den ${position}n. Ihr Wert ist ${answer}.`
  }
}

function decompose(seed: number, difficulty: Difficulty): Exercise {
  const random = seededRandom(seed)
  const hundreds = integer(random, 1, 9)
  const tens = integer(random, 0, 9)
  const ones = integer(random, 0, 9)
  const number = hundreds * 100 + tens * 10 + ones
  const answer = `${hundreds * 100} + ${tens * 10} + ${ones}`
  const values = { number, answer }
  return {
    ...base('decompose', seed, difficulty, values),
    typeId: 'decompose-number',
    prompt: `Welche Zerlegung passt zu ${number}?`,
    answerMode: 'choice',
    correctAnswer: answer,
    options: textOptions(random, answer, [
      `${hundreds} + ${tens} + ${ones}`,
      `${tens * 100} + ${hundreds * 10} + ${ones}`,
      `${hundreds * 100} + ${ones * 10} + ${tens}`
    ]),
    hints: [
      { level: 1, text: 'Trenne Hunderter, Zehner und Einer.' },
      { level: 2, text: `${hundreds} Hunderter sind ${hundreds * 100}, ${tens} Zehner sind ${tens * 10}.` }
    ],
    errorFeedback: 'Achte darauf, dass jede Ziffer den Wert ihrer Stelle bekommt.',
    explanation: `${number} besteht aus ${hundreds * 100}, ${tens * 10} und ${ones}.`
  }
}

function compose(seed: number, difficulty: Difficulty): Exercise {
  const random = seededRandom(seed)
  const hundreds = integer(random, 1, 9)
  const tens = integer(random, 0, 9)
  const ones = integer(random, 0, 9)
  const answer = hundreds * 100 + tens * 10 + ones
  const values = { hundreds, tens, ones, answer }
  return {
    ...base('compose', seed, difficulty, values),
    typeId: 'compose-number',
    prompt: `Baue die Zahl aus ${hundreds} Hundertern, ${tens} Zehnern und ${ones} Einern.`,
    answerMode: 'number',
    correctAnswer: String(answer),
    hints: [
      { level: 1, text: 'Schreibe zuerst die Hunderter-, dann die Zehner- und zuletzt die Einerziffer.' },
      { level: 2, text: `${hundreds * 100} + ${tens * 10} + ${ones} ergibt die gesuchte Zahl.` }
    ],
    errorFeedback: 'Prüfe die Reihenfolge: Hunderter, Zehner, Einer.',
    explanation: `${hundreds * 100} + ${tens * 10} + ${ones} = ${answer}.`
  }
}

function neighbors(seed: number, difficulty: Difficulty, unit: 10 | 100): Exercise {
  const random = seededRandom(seed)
  let number = integer(random, unit + 1, unit === 10 ? 989 : 899)
  while (number % unit === 0) number += 1
  const lower = Math.floor(number / unit) * unit
  const upper = lower + unit
  const answer = `${lower} und ${upper}`
  const skillId: SkillId = unit === 10 ? 'neighbor-tens' : 'neighbor-hundreds'
  const noun = unit === 10 ? 'Nachbarzehner' : 'Nachbarhunderter'
  const values = { number, lower, upper }
  return {
    ...base(skillId, seed, difficulty, values),
    typeId: unit === 10 ? 'neighbor-tens' : 'neighbor-hundreds',
    prompt: `Zwischen welchen ${noun}n liegt ${number}?`,
    answerMode: 'choice',
    correctAnswer: answer,
    options: textOptions(random, answer, [
      `${lower - unit} und ${lower}`,
      `${upper} und ${upper + unit}`,
      `${lower - unit} und ${upper}`
    ]),
    hints: [
      { level: 1, text: `Suche die volle ${unit === 10 ? 'Zehner' : 'Hunderter'}zahl direkt unter und über ${number}.` },
      { level: 2, text: `${number} ist größer als ${lower} und kleiner als ${upper}.` }
    ],
    errorFeedback: `Die gesuchten Zahlen müssen direkt unter und über ${number} liegen.`,
    explanation: `${lower} < ${number} < ${upper}. Darum sind ${lower} und ${upper} die ${noun}.`
  }
}

function rounding(seed: number, difficulty: Difficulty, unit: 10 | 100): Exercise {
  const random = seededRandom(seed)
  let number = integer(random, unit === 10 ? 5 : 50, unit === 10 ? 995 : 950)
  while (number % unit === 0) number += 1
  const lower = Math.floor(number / unit) * unit
  const upper = lower + unit
  const answer = Math.round(number / unit) * unit
  const skillId: SkillId = unit === 10 ? 'round-tens' : 'round-hundreds'
  const label = unit === 10 ? 'Zehner' : 'Hunderter'
  const values = { number, lower, upper, answer }
  return {
    ...base(skillId, seed, difficulty, values),
    typeId: unit === 10 ? 'round-tens' : 'round-hundreds',
    prompt: `Runde ${number} auf den nächsten ${label}.`,
    answerMode: 'choice',
    correctAnswer: String(answer),
    options: numberOptions(random, answer, [lower, upper, answer === lower ? lower - unit : upper + unit]),
    hints: [
      { level: 1, text: `${number} liegt zwischen ${lower} und ${upper}.` },
      { level: 2, text: `Der Abstand zu ${lower} ist ${number - lower}, der Abstand zu ${upper} ist ${upper - number}.` }
    ],
    errorFeedback: `Vergleiche die Abstände zu ${lower} und ${upper}.`,
    explanation: `${number} liegt näher bei ${answer}. Deshalb wird auf ${answer} gerundet.`
  }
}

type WordTemplate = {
  text: (first: number, second: number) => string
  relevant: (first: number, second: number) => string
  operation: '+' | '−'
  result: (first: number, second: number) => number
  answer: (result: number) => string
}

const WORD_TEMPLATES: WordTemplate[] = [
  {
    text: (first, second) => `Mila sammelt ${first} Muscheln. Am Strand findet sie noch ${second}. Wie viele Muscheln hat sie jetzt?`,
    relevant: (first, second) => `${first} Muscheln und ${second} neue Muscheln`,
    operation: '+',
    result: (first, second) => first + second,
    answer: (result) => `Mila hat jetzt ${result} Muscheln.`
  },
  {
    text: (first, second) => `In einer Kiste liegen ${first} Buntstifte. ${second} werden herausgenommen. Wie viele bleiben in der Kiste?`,
    relevant: (first, second) => `${first} Buntstifte und ${second} herausgenommene`,
    operation: '−',
    result: (first, second) => first - second,
    answer: (result) => `${result} Buntstifte bleiben in der Kiste.`
  }
]

function wordProblem(seed: number, difficulty: Difficulty): Exercise {
  const random = seededRandom(seed)
  const template = pick(random, WORD_TEMPLATES)
  const first = template.operation === '+' ? integer(random, 7, 14) : integer(random, 12, 20)
  const second = integer(random, 2, template.operation === '+' ? 6 : Math.min(8, first - 1))
  const result = template.result(first, second)
  const text = template.text(first, second)
  const relevant = template.relevant(first, second)
  const answerSentence = template.answer(result)
  const steps: ExerciseStep[] = [
    {
      id: 'relevant',
      prompt: 'Welche Angaben sind wichtig?',
      options: textOptions(random, relevant, [`Nur die Zahl ${first}`, 'Es gibt keine wichtigen Zahlen']),
      correctAnswer: relevant,
      errorFeedback: 'Für die Lösung brauchst du beide Mengen aus dem Text.',
      successFeedback: 'Genau, diese beiden Angaben helfen dir.'
    },
    {
      id: 'operation',
      prompt: 'Welche Rechenart passt?',
      options: [
        { value: '+', label: 'Plus: Es kommt etwas dazu.' },
        { value: '−', label: 'Minus: Es geht etwas weg.' },
        { value: '·', label: 'Mal: Es gibt gleich große Gruppen.' }
      ],
      correctAnswer: template.operation,
      errorFeedback: template.operation === '+' ? 'Im Text kommt etwas dazu.' : 'Im Text wird etwas herausgenommen.',
      successFeedback: 'Diese Rechenart passt zur Geschichte.'
    },
    {
      id: 'calculate',
      prompt: `Rechne: ${first} ${template.operation} ${second} = ?`,
      options: numberOptions(random, result, [result - 1, result + 1]),
      correctAnswer: String(result),
      errorFeedback: 'Rechne die beiden wichtigen Zahlen noch einmal.',
      successFeedback: 'Die Rechnung stimmt.'
    },
    {
      id: 'check',
      prompt: 'Welcher Antwortsatz passt?',
      options: textOptions(random, answerSentence, [
        template.answer(Math.max(0, result - 1)),
        template.answer(result + 2)
      ]),
      correctAnswer: answerSentence,
      errorFeedback: 'Der Antwortsatz muss zu deinem Rechenergebnis passen.',
      successFeedback: 'Rechnung und Antwort passen zusammen.'
    }
  ]
  const values = { first, second, result, operation: template.operation }
  return {
    ...base('word-problem', seed, difficulty, values),
    typeId: 'guided-word-problem',
    prompt: text,
    answerMode: 'guided-word',
    correctAnswer: answerSentence,
    steps,
    hints: [
      { level: 1, text: 'Unterstreiche im Kopf die beiden Mengen.' },
      { level: 2, text: template.operation === '+' ? 'Es kommt etwas dazu. Die Menge wird größer.' : 'Es geht etwas weg. Die Menge wird kleiner.' }
    ],
    errorFeedback: 'Gehe die Geschichte Schritt für Schritt durch.',
    explanation: `${first} ${template.operation} ${second} = ${result}. ${answerSentence}`
  }
}

const SYMMETRY_SHAPES: number[][][] = [
  [[1, 0, 0, 0], [1, 1, 0, 0], [0, 1, 1, 0], [0, 0, 1, 0]],
  [[0, 1, 0, 0], [1, 1, 0, 0], [1, 0, 0, 0], [1, 1, 1, 0]],
  [[1, 1, 0, 0], [0, 1, 0, 0], [0, 1, 1, 0], [0, 0, 1, 0]]
]

function mirrorGrid(grid: number[][]): number[][] {
  return grid.map((row) => [...row].reverse())
}

function flipGrid(grid: number[][]): number[][] {
  return [...grid].reverse().map((row) => [...row])
}

function symmetry(seed: number, difficulty: Difficulty): Exercise {
  const random = seededRandom(seed)
  const sourceGrid = pick(random, SYMMETRY_SHAPES)
  const correct = mirrorGrid(sourceGrid)
  const options = shuffle(random, [
    { value: 'mirror', label: 'Antwort A', grid: correct },
    { value: 'shift', label: 'Antwort B', grid: sourceGrid },
    { value: 'flip', label: 'Antwort C', grid: flipGrid(sourceGrid) }
  ])
  const values = { shape: SYMMETRY_SHAPES.indexOf(sourceGrid), answer: 'mirror' }
  return {
    ...base('symmetry', seed, difficulty, values),
    typeId: 'grid-symmetry',
    prompt: 'Welches Bild ist das genaue Spiegelbild an einer senkrechten Spiegelachse?',
    answerMode: 'symmetry',
    correctAnswer: 'mirror',
    sourceGrid,
    options,
    hints: [
      { level: 1, text: 'Was links nah an der Spiegelkante liegt, liegt im Spiegel rechts nah an der Kante.' },
      { level: 2, text: 'Vergleiche jede Reihe von links nach rechts in umgekehrter Reihenfolge.' }
    ],
    errorFeedback: 'Das ist verschoben oder gekippt. Beim Spiegeln tauschen links und rechts die Plätze.',
    explanation: 'Beim Spiegelbild bleibt jede Reihe gleich, aber ihre Reihenfolge läuft von rechts nach links.'
  }
}

export function generateExercise(skillId: SkillId, seed: number, difficulty: Difficulty = 1): Exercise {
  switch (skillId) {
    case 'addition': return addition(seed, difficulty)
    case 'subtraction': return subtraction(seed, difficulty)
    case 'multiplication': return multiplication(seed, difficulty)
    case 'division': return division(seed, difficulty)
    case 'place-value': return placeValue(seed, difficulty)
    case 'decompose': return decompose(seed, difficulty)
    case 'compose': return compose(seed, difficulty)
    case 'neighbor-tens': return neighbors(seed, difficulty, 10)
    case 'neighbor-hundreds': return neighbors(seed, difficulty, 100)
    case 'round-tens': return rounding(seed, difficulty, 10)
    case 'round-hundreds': return rounding(seed, difficulty, 100)
    case 'word-problem': return wordProblem(seed, difficulty)
    case 'symmetry': return symmetry(seed, difficulty)
  }
}

export function isAnswerCorrect(exercise: Exercise, answer: string): boolean {
  return answer.trim() === exercise.correctAnswer
}

export function isStepAnswerCorrect(step: ExerciseStep, answer: string): boolean {
  return answer === step.correctAnswer
}

export { mirrorGrid }
