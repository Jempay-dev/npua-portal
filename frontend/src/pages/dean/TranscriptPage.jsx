import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon, DownloadIcon } from "../../components/ui/Icons.jsx";
import { useData } from "../../data/store.js";
import { byId, specialtyOf, studentTranscript } from "../../data/queries.js";
import { formatNumber } from "../../utils/grading.js";
import { semesterLabel } from "../../utils/semester.js";
import { fullName } from "../../utils/format.js";

// Ակադեմիական տեղեկանք — one student's approved grades, laid out as an A4 page.
// "Download PDF" opens the browser print dialog → choose "Save as PDF".

export default function TranscriptPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const data = useData();
  const student = byId(data.students, id);
  if (!student) return <Navigate to="/students" replace />;

  const group = byId(data.groups, student.groupId);
  const specialty = specialtyOf(group);
  const semesters = studentTranscript(data, student.id);

  return (
    <>
      <div className="transcript-toolbar no-print">
        <button type="button" className="link-btn back-btn" onClick={() => navigate(-1)}>
          <ArrowLeftIcon size={16} /> Հետ
        </button>
        <button type="button" className="btn btn--primary" onClick={() => window.print()}>
          <DownloadIcon /> Ներբեռնել PDF
        </button>
      </div>

      <article className="paper">
        <header className="paper__header">
          <p>ՀԱՅԱՍՏԱՆԻ ԱԶԳԱՅԻՆ ՊՈԼԻՏԵԽՆԻԿԱԿԱՆ ՀԱՄԱԼՍԱՐԱՆ</p>
          <h1>ԱԿԱԴԵՄԻԱԿԱՆ ՏԵՂԵԿԱՆՔ</h1>
        </header>

        <table className="paper-table paper-table--info">
          <tbody>
            <tr>
              <th>Ուսանողական №</th>
              <td>{student.studentNo}</td>
            </tr>
            <tr>
              <th>Ազգանուն Անուն Հայրանուն</th>
              <td className="strong">{fullName(student)}</td>
            </tr>
            <tr>
              <th>Մասնագիտություն</th>
              <td>{specialty?.name}</td>
            </tr>
            <tr>
              <th>Որակավորում</th>
              <td>{specialty?.qualification}</td>
            </tr>
            <tr>
              <th>Խումբ · Ուսուցման ձև</th>
              <td>{group?.code} · Առկա</td>
            </tr>
          </tbody>
        </table>

        {semesters.length === 0 && <p className="empty">Հաստատված գնահատականներ դեռ չկան։</p>}

        {semesters.map(({ semester, results, summary, cumulative }) => (
          <section key={semester} className="paper__semester">
            <h2>{semesterLabel(semester)}</h2>
            <table className="paper-table">
              <thead>
                <tr>
                  <th>Ծածկագիր</th>
                  <th>Դասընթացի անվանում</th>
                  <th className="num">Կրեդիտ</th>
                  <th className="num">Գնահատական</th>
                  <th className="num">Թվանիշ</th>
                </tr>
              </thead>
              <tbody>
                {results.map(({ subject, result }) => (
                  <tr key={subject.id}>
                    <td className="nowrap">{subject.code}</td>
                    <td>{subject.name}</td>
                    <td className="num">{subject.credits}</td>
                    <td className="num">{result.type === "credit" ? result.label : result.total ?? "—"}</td>
                    <td className="num">{result.type === "exam" && result.complete ? `${formatNumber(result.points)} (${result.letter})` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <SummaryRow title="Կիսամյակային արդյունքներ" summary={summary} />
            <SummaryRow title="Կուտակային արդյունքներ" summary={cumulative} />
          </section>
        ))}
      </article>
    </>
  );
}

function SummaryRow({ title, summary }) {
  return (
    <table className="paper-table paper-table--summary">
      <caption>{title}</caption>
      <thead>
        <tr>
          <th>Ընդհանուր կրեդիտներ</th>
          <th>Որակական կրեդիտներ</th>
          <th>Կշռված միավորների գումար</th>
          <th>Միջին միավոր</th>
          <th>ՄՈԳ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{summary.totalCredits}</td>
          <td>{summary.qualityCredits}</td>
          <td>{formatNumber(summary.weightedScore)}</td>
          <td>{formatNumber(summary.averageScore)}</td>
          <td className="strong">{formatNumber(summary.gpa)}</td>
        </tr>
      </tbody>
    </table>
  );
}
