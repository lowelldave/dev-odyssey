/**
 * The rugged notebook-page backdrop for a section. Only the paper is tilted:
 * it is drawn behind the section's content, so text and controls stay straight.
 * Put it as the first child of an element with the `paper` class.
 */
export default function Paper({ tape = 'none', seal }: { tape?: 'left' | 'right' | 'both' | 'none'; seal?: 'red' | 'gold' }) {
  return (
    <>
      <span className="paper-under" aria-hidden />
      <span className="paper-sheet" aria-hidden />
      {(tape === 'left' || tape === 'both') && <span className="tape tape-l" aria-hidden />}
      {(tape === 'right' || tape === 'both') && <span className="tape tape-r" aria-hidden />}
      {seal && <span className={`wax-seal wax-${seal}`} aria-hidden />}
    </>
  );
}
