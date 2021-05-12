import ReactUtterences from 'react-utterances'

export default function Comments() {
  const repo = 'weltonclima/Challenge05-CreatingProjectFromScratch'

  return (
    <>
      <ReactUtterences
        repo={repo}
        type={'pathname'}
      />
    </>
  );
}
