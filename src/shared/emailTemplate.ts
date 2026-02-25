import { IAppointment } from '../app/modules/appointment/appointment.interface';
import { IJob } from '../app/modules/job/job.interface';
import { IJobSeeker } from '../app/modules/jobSeeker/jobSeeker.interface';
import { IShiftPlan } from '../app/modules/shiftPlan/shiftPlan.interface';
import { ISupport } from '../app/modules/support/support.interface';
import { IUser } from '../app/modules/user/user.interface';
import { IWorker } from '../app/modules/worker/worker.interface';
import config from '../config';
import { ICreateAccount, IResetPassword } from '../types/emailTamplate';

const createAccount = (values: ICreateAccount) => {
  const data = {
    to: values.email,
    subject: 'Bestätigen Sie Ihr Konto', // "Verify your account"
    html: `
      <body
          style="font-family: 'Trebuchet MS', sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
          <div
              style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
              <img src="https://jobsinapp.de/logo.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
              <h2 style="color: #074E5E; font-size: 24px; margin-bottom: 20px;">
                Hallo ${values.name}${values.name && ','} 
                Ihre Zugangsdaten für ${config.server_name}
              </h2>
              <div style="text-align: center;">
                  <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Ihr Einmal-Code lautet:</p>
                  <span
                      style="background-color: #074E5E; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">
                      ${values.otp}
                  </span>
                  <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Dieser Code ist für 3 Minuten gültig.</p>
              </div>
          </div>
      </body>
    `,
  };
  return data;
};

const resetPassword = (values: IResetPassword) => {
  const data = {
    to: values.email,
    subject: 'Passwort zurücksetzen', // "Reset your password"
    html: `
      <body style="font-family: 'Trebuchet MS', sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
          <div
              style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
              <img src="https://jobsinapp.de/logo.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
              <div style="text-align: center;">
                  <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Ihr Einmal-Code lautet:</p>
                  <span
                      style="background-color: #074E5E; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">
                      ${values.otp}
                  </span>
                  <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Dieser Code ist für 3 Minuten gültig.</p>
                  <p style="color: #b9b4b4; font-size: 16px; line-height: 1.5; margin-bottom: 20px;text-align:center">
                    Falls Sie diesen Code nicht angefordert haben, können Sie diese E-Mail einfach ignorieren. Eventuell hat jemand anderes versehentlich Ihre E-Mail-Adresse eingegeben.
                  </p>
              </div>
          </div>
      </body>
    `,
  };
  return data;
};

const confirmAppointment = (values: IAppointment) => {
  const data = {
    to: values.receiver,
    subject: 'Neuer Termin verfügbar!', // "New Appointment Available!"
    html: `
      <body style="font-family: 'Trebuchet MS', sans-serif; background-color: #f9f9f9; margin: 0; padding: 50px; color: #555;">
          <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
              <img src="https://jobsinapp.de/logo.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
              
              <div style="text-align: center;">
                  <h2 style="color: #074E5E; margin-bottom: 10px;">Neuer Termin verfügbar!</h2>
                  <p style="font-size: 16px; line-height: 1.5; margin-bottom: 25px;">Ein Termin ist für Sie verfügbar. Bitte bestätigen Sie diesen in Ihrem JobsinApp-Konto und erscheinen Sie zum vereinbarten Zeitpunkt an unserer Adresse.</p>
                  
                  <div style="background-color: #f4fdf3; border: 1px solid #e0eee0; border-radius: 8px; padding: 20px; text-align: left; margin-bottom: 25px;">
                      <p style="margin: 5px 0;"><strong>📅 Datum & Uhrzeit:</strong> ${new Date(
                        values.scheduledAt,
                      ).toLocaleString('de-DE')}</p>
                      ${
                        values.address &&
                        `<p style="margin: 5px 0;"><strong>📍 Adresse:</strong> ${values.address}</p>`
                      }
                      <p style="margin: 5px 0;"><strong>✉️ Nachricht:</strong> ${
                        values.message
                      }</p>
                  </div>

                  <p style="color: #b9b4b4; font-size: 14px; line-height: 1.5; margin-top: 30px;">
                    Falls Sie diesen Termin verschieben oder absagen müssen, melden Sie sich bitte in Ihrem Konto an oder kontaktieren Sie den Support.
                  </p>
              </div>
          </div>
      </body>
    `,
  };
  return data;
};

const supportReply = (values: ISupport & { reply: string }) => {
  const data = {
    to: values.email,
    subject: 'Support-Update', // "Support Update"
    html: `
      <body style="font-family: 'Trebuchet MS', sans-serif; background-color: #f9f9f9; margin: 0; padding: 50px; color: #555;">
          <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
              <img src="https://jobsinapp.de/logo.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
              
              <div style="">
                  <h2 style="color: #074E5E; margin-bottom: 10px; text-align: center;">Support-Update</h2>
                  <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                      Hallo <strong>${values.name || 'zusammen'}</strong>,<br><br>
                      vielen Dank, dass Sie sich an das Support-Team von JobsinApp gewendet haben. Wir haben Ihre Anfrage geprüft.
                  </p>
                  
                  <div style="background-color: #f4fdf3; border: 1px solid #e0eee0; border-radius: 8px; padding: 20px; text-align: left; margin-bottom: 25px;">
                      <p style="margin: 5px 0; color: #074E5E; font-weight: bold;">Unsere Antwort:</p>
                      <p style="margin: 10px 0; line-height: 1.5;">
                          ${values.reply}
                      </p>
                  </div>

                  <p style="font-size: 15px; line-height: 1.5; margin-bottom: 25px;">
                      Falls Sie weitere Fragen haben oder Ihr Anliegen noch nicht vollständig geklärt ist, antworten Sie einfach auf diese E-Mail oder besuchen Sie unser Hilfe-Center.
                  </p>

                  <p style="color: #b9b4b4; font-size: 14px; line-height: 1.5; margin-top: 30px;">
                      Mit freundlichen Grüßen,<br>
                      <strong>Ihr JobsinApp Support-Team</strong>
                  </p>
              </div>
          </div>
      </body>
    `,
  };
  return data;
};

// payment failed
const paymentFailed = (values: any) => {
  const data = {
    to: values.email,
    subject: values.subject || 'Zahlung fehlgeschlagen', // "Payment Failed"
    html: `
      <body style="font-family: 'Trebuchet MS', sans-serif; background-color: #f9f9f9; margin: 0; padding: 50px; color: #555;">
        <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <img src="https://jobsinapp.de/logo.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
            
            <div>
                <h2 style="color: #D93025; margin-bottom: 10px; text-align: center;">Zahlung fehlgeschlagen</h2>
                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                    Hallo <strong>${values.name || 'zusammen'}</strong>,<br><br>
                    wir konnten die Zahlung für Ihr <strong>${values.packageName || 'JobsinApp-Abonnement'}</strong> nicht bearbeiten. Dies kann an einer abgelaufenen Karte, unzureichender Deckung oder einer Bankbeschränkung liegen.
                </p>
                
                <div style="background-color: #fff5f5; border: 1px solid #f8d7da; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 25px;">
                    <p style="margin: 5px 0; color: #D93025; font-weight: bold;">Was ist passiert?</p>
                    <p style="margin: 10px 0; line-height: 1.5; font-size: 15px;">
                        Unser letzter Versuch am <strong>${new Date().toLocaleDateString('de-DE')}</strong> ist fehlgeschlagen. Um den Zugriff auf Premium-Funktionen zu behalten, aktualisieren Sie bitte Ihre Zahlungsinformationen.
                    </p>
                    <a href="${values.billingUrl || '#'}" style="display: inline-block; padding: 12px 25px; background-color: #074E5E; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;">Zahlungsmethode aktualisieren</a>
                </div>

                <p style="font-size: 15px; line-height: 1.5; margin-bottom: 25px;">
                    Keine Sorge, Ihr Konto ist vorerst noch aktiv. Wenn das Problem jedoch nicht bald behoben wird, könnte Ihr Abonnement auf die kostenlose Version zurückgestuft werden.
                </p>

                <p style="color: #b9b4b4; font-size: 14px; line-height: 1.5; margin-top: 30px;">
                    Mit freundlichen Grüßen,<br>
                    <strong>Ihr JobsinApp Billing-Team</strong>
                </p>
            </div>
        </div>
      </body>
    `,
  };
  return data;
};

const hiringRequestToAdmin = (
  job: IJob,
  employer: IUser,
  email: string,
  address: string,
) => {
  const data = {
    to: email,
    subject: `Vermittlungsanfrage: ${employer.name} - ${job.category}`, // "Hiring Request"
    html: `
      <body style="font-family: 'Trebuchet MS', sans-serif; background-color: #f0f0f0; padding: 20px; color: #333;">
        <div style="max-width: 700px; margin: 0 auto; background-color: #ffffff; padding: 40px; border: 1px solid #ddd;">
            
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
                <div style="font-size: 18px; line-height: 1.4;">
                    <h2 style="margin: 0; font-size: 20px;">Personalvermittlungsvertrag</h2>
                    <p style="margin: 10px 0 0 0;">
                        <strong>Auftraggeber</strong><br>
                        ${employer.name}<br>
                        ${employer.email}<br>
                        ${employer.address}
                    </p>
                    <p style="margin: 10px 0 0 0;">
                        <strong>Vermittler</strong><br>
                        JobsinApp<br>
                        ${address}
                    </p>
                </div>
                <img src="https://jobsinapp.de/logo.png" alt="Logo" style="width: 120px;" />
            </div>

            <div style="margin-bottom: 20px;">
                <h3 style="font-size: 16px; margin-bottom: 5px;">Vertragsinhalt</h3>
                <p style="font-size: 13px; line-height: 1.5; margin: 0;">Der Auftraggeber beauftragt den Vermittler mit der Suche nach geeigneten Kandidaten für eine zu besetzende Stelle in seinem Unternehmen. Diese Vereinbarung regelt die Bedingungen der Personalvermittlung sowie die gegenseitigen Rechte und Pflichten der Vertragsparteien.</p>
            </div>

            <div style="font-size: 13px; line-height: 1.5;">
                <h4 style="margin: 15px 0 5px 0;">§ 1 Gegenstand der Vereinbarung</h4>
                <p style="margin: 0;">Der Vermittler verpflichtet sich, für eine vom Arbeitgeber ausgeschriebene Stelle geeignete Kandidaten zu suchen und dem Arbeitgeber vorzustellen. Der Auftraggeber verpflichtet sich, dem Vermittler alle für die Suche notwendigen relevanten Informationen zur Verfügung zu stellen, wie z. B. Anforderungsprofile und eine detaillierte Stellenbeschreibung.</p>

                <h4 style="margin: 15px 0 5px 0;">§ 2 Leistungen des Vermittlers</h4>
                <p style="margin: 0;">1. Identifizierung geeigneter Kandidaten und Vorschlag an den Arbeitgeber. 2. Durchführung einer Vorauswahl, Prüfung der Qualifikationen und ggf. Durchführung von Vorstellungsgesprächen. 3. Bereitstellung einer Liste geeigneter Kandidaten. 4. Beratung des Auftraggebers bei der Auswahl und Unterstützung bei der Organisation von Vorstellungsgesprächen.</p>

                <h4 style="margin: 15px 0 5px 0;">§ 3 Pflichten des Auftraggebers</h4>
                <p style="margin: 0;">Der Arbeitgeber informiert rechtzeitig über die Anforderungen der Stelle und die Kontaktdaten. Der Auftraggeber verpflichtet sich, Kandidaten zu prüfen, die Kommunikation aufrechtzuerhalten, Vorstellungsgespräche zu führen und die endgültige Einstellungsentscheidung zu treffen. Der Auftraggeber muss den Vermittler unverzüglich schriftlich informieren, sobald ein Kandidat eingestellt wurde.</p>

                <h4 style="margin: 15px 0 5px 0;">§ 4 Vergütung und Zahlungsbedingungen</h4>
                <p style="margin: 0;"><strong>Vermittlungsgebühr:</strong> 25% (zzgl. MwSt.) des vereinbarten Bruttojahresgehalts. <br>
                <strong>Zahlungsziel:</strong> Fällig spätestens 14 Tage nach Arbeitsbeginn. <br>
                <strong>Zusatzkosten:</strong> Werden vom Auftraggeber nur getragen, wenn dies vorher ausdrücklich vereinbart wurde.</p>

                <h4 style="margin: 15px 0 5px 0;">§ 5 Garantien und Rückerstattungen</h4>
                <p style="margin: 0;"><strong>50% Rückerstattung:</strong> Wenn der Kandidat innerhalb von 3 Monaten kündigt. <br>
                <strong>30% Rückerstattung:</strong> Wenn der Kandidat zwischen 3 und 6 Monaten kündigt. <br>
                Rückerstattungsansprüche erlöschen, wenn der Kandidat innerhalb des Geltungsbereichs dieser Vereinbarung vom Auftraggeber oder einem verbundenen Unternehmen/Partnerunternehmen (gemäß §§ 15 ff. AktG) wiedereingestellt wird.</p>

                <h4 style="margin: 15px 0 5px 0;">§ 6 Vertraulichkeit und Datenschutz</h4>
                <p style="margin: 0;">Beide Parteien vereinbaren, personenbezogene Daten von Kandidaten gemäß BDSG und DSGVO zu behandeln. Diese Verpflichtung bleibt auch nach Vertragsbeendigung bestehen.</p>

                <h4 style="margin: 15px 0 5px 0;">§ 7 Haftung</h4>
                <p style="margin: 0;">Der Vermittler haftet nicht für die Richtigkeit der Kandidateninformationen. Der Auftraggeber übernimmt die volle Verantwortung für die endgültigen Einstellungsentscheidungen. Der Vermittler haftet nicht für Schäden, die aus fehlerhaften Informationen des Auftraggebers resultieren.</p>

                <h4 style="margin: 15px 0 5px 0;">§ 8 Dauer und Kündigung</h4>
                <p style="margin: 0;">Wirksam ab Bestätigung (Häkchen) auf der JobsinApp-Plattform. Kann von jeder Partei mit einer Frist von 14 Tagen schriftlich gekündigt werden.</p>

                <h4 style="margin: 15px 0 5px 0;">§ 9 Schlussbestimmungen</h4>
                <p style="margin: 0;">Änderungen oder Ergänzungen dieser Vereinbarung bedürfen der Schriftform. Mündliche Nebenabreden sind nur wirksam, wenn sie schriftlich bestätigt wurden.
                Sollten einzelne Bestimmungen dieses Vertrages unwirksam oder undurchführbar sein, bleibt die Wirksamkeit des Vertrages im Übrigen unberührt. Die unwirksame Bestimmung ist durch eine wirksame zu ersetzen, die dem wirtschaftlichen Zweck der unwirksamen Bestimmung am nächsten kommt.</p>
            </div>

            <div style="margin-top: 30px; border: 1px solid #ccc; padding: 20px;">
                <h2 style="margin: 0 0 10px 0; font-size: 22px;">Job-Details</h2>
                <p style="margin: 0; color: #666;">${employer.address}</p>
                <h3 style="margin: 10px 0 5px 0; font-size: 18px;">${job.subCategory}</h3>
                <p style="margin: 0; font-size: 14px;"><strong>${job.jobType}</strong></p>
                <p style="margin: 5px 0; font-size: 16px; font-weight: bold;">€${job.salaryAmount}/${job.salaryType}</p>
                <p style="margin: 0; color: #888; font-size: 12px;">📅 Frist: ${new Date(job.deadline).toLocaleDateString('de-DE')}</p>

                <h4 style="margin: 20px 0 5px 0;">Stellenbeschreibung</h4>
                <p style="margin: 0; font-size: 13px;">${job.description}</p>

                <h4 style="margin: 15px 0 5px 0;">Aufgabenbereiche</h4>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
                    ${job.responsibilities.map(res => `<li>${res}</li>`).join('')}
                </ul>

                <h4 style="margin: 15px 0 5px 0;">Qualifikationen</h4>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
                    ${job.qualifications.map(qual => `<li>${qual}</li>`).join('')}
                </ul>
            </div>

            <div style="margin-top: 20px; border: 1px solid #ccc; padding: 10px; display: flex; justify-content: space-between;">
                <div style="width: 45%;">
                    <p style="margin: 0; font-size: 12px; color: #888;">Ort</p>
                    <p style="margin: 0; font-size: 14px;"><strong>${employer.address || 'Online'}</strong></p>
                </div>
                <div style="width: 45%;">
                    <p style="margin: 0; font-size: 12px; color: #888;">Datum</p>
                    <p style="margin: 0; font-size: 14px;"><strong>${new Date().toLocaleDateString('de-DE')}</strong></p>
                </div>
            </div>
            <p style="font-size: 11px; font-style: italic; margin-top: 5px;">Der Auftraggeber hat den Vertrag durch Auswahl des Kontrollkästchens bestätigt, daher war keine Unterschrift erforderlich und die Vereinbarung ist nun in Kraft.</p>

        </div>
      </body>
    `,
  };
  return data;
};

const shiftPlanToWorker = (worker: IWorker, shiftPlan: IShiftPlan) => {
  // Extract month/year for the title using German locale
  const firstPlanDate = shiftPlan.plans[0]?.days[0] || new Date();
  const planMonthYear = new Intl.DateTimeFormat('de-DE', {
    month: 'long',
    year: 'numeric',
  }).format(firstPlanDate);

  // options for consistent German formatting
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Europe/Berlin', 
  };

  const data = {
    to: worker.email,
    subject: `Ihr Schichtplan für ${planMonthYear}`, // "Your Shift Plan"
    html: `
      <body style="font-family: 'Trebuchet MS', sans-serif; background-color: #ffffff; margin: 0; padding: 40px; color: #333;">
        <div style="max-width: 800px; margin: 0 auto;">
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
            <div style="display: flex; align-items: center;">
               <h1 style="font-size: 24px; margin: 0; font-weight: bold;">Schichtplanansicht</h1>
            </div>
            <img src="https://jobsinapp.de/logo.png" alt="JobsinApp Logo" style="width: 80px;" />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; font-size: 15px;">
            <div>
              <p style="margin: 5px 0;"><strong>Name</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ${worker.name}</p>
              <p style="margin: 5px 0;"><strong>Adresse</strong> &nbsp;: ${worker.address}</p>
            </div>
            <div>
              <p style="margin: 5px 0;"><strong>E-Mail</strong> &nbsp;&nbsp;&nbsp;&nbsp;: ${worker.email}</p>
              <p style="margin: 5px 0;"><strong>Kontakt</strong> &nbsp;: ${worker.phone}</p>
            </div>
          </div>

          <div style="margin-bottom: 25px;">
            <h2 style="font-size: 18px; margin: 0;">Plan für ${planMonthYear}</h2>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 14px; text-align: left;">
            <thead>
              <tr style="color: #333;">
                <th style="padding: 10px 0; font-weight: normal; width: 20%;">Datum</th>
                <th style="padding: 10px 0; font-weight: normal; width: 20%;">Tag</th>
                <th style="padding: 10px 0; font-weight: normal; text-align: center; width: 30%;">Beginn — Ende</th>
                <th style="padding: 10px 0; font-weight: normal; text-align: right; width: 20%;">Zeitraum</th>
              </tr>
            </thead>
            <tbody>
              ${shiftPlan.plans
                .map(plan =>
                  plan.days
                    .map(date => {
                      const d = new Date(date);
                      return `
                    <tr style="border-bottom: none;">
                      <td style="padding: 12px 0;">${d.toLocaleDateString('de-DE')}</td>
                      <td style="padding: 12px 0;">${d.toLocaleDateString('de-DE', { weekday: 'long' })}</td>
                      <td style="padding: 12px 0; text-align: center;">
                        <span style="display: inline-block;">${new Date(plan.startTime).toLocaleTimeString('de-DE', timeOptions)}</span>
                        <span style="display: inline-block; width: 40px; height: 1px; background-color: #074E5E; margin: 0 10px; vertical-align: middle;"></span>
                        <span style="display: inline-block;">${new Date(plan.endTime).toLocaleTimeString('de-DE', timeOptions)}</span>
                      </td>
                      <td style="padding: 12px 0; text-align: right;">${plan.shift}</td>
                    </tr>
                  `;
                    })
                    .join(''),
                )
                .join('')}
            </tbody>
          </table>

          <div style="margin-top: 40px;">
            <h3 style="font-size: 18px; margin-bottom: 10px;">Anmerkungen</h3>
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              ${
                shiftPlan.plans
                  .map(p => p.remarks)
                  .filter(r => r)
                  .join('<br>') || 'Keine spezifischen Anmerkungen für diesen Zeitraum.'
              }
            </p>
          </div>

        </div>
      </body>
    `,
  };
  return data;
};

// job seeker alert email template (to employers)
const jobSeekerAlert = (
  employerUser: Partial<IUser>,
  jobSeekerUsers: (IUser & { jobSeeker: IJobSeeker })[],
) => {
  const data = {
    to: employerUser.email,
    subject: `🚀 ${jobSeekerUsers.length} passende Kandidaten gefunden - Jobsin App`, // "Qualified Candidates Found"
    html: `
      <div style="font-family: 'Trebuchet MS', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f7f6;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 25px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05); border: 1px solid #e1e4e8;">
          
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f0f0f0;">
            <h1 style="margin: 0; color: #074E5E; font-size: 22px;">Neue passende Talente</h1>
            <p style="margin: 5px 0; color: #666;">Hallo ${employerUser.name || 'zusammen'}, wir haben Kandidaten gefunden, die Ihren Anforderungen entsprechen.</p>
          </div>

          <div style="margin-top: 10px;">
            ${jobSeekerUsers
              .map((candidate, index) => {
                const mainCategories = candidate.jobSeeker.experiences
                  .map(exp => exp.category)
                  .filter((v, i, a) => a.indexOf(v) === i)
                  .join(', ');

                return `
                <div style="padding: 20px 0; border-bottom: ${index === jobSeekerUsers.length - 1 ? 'none' : '1px solid #eee'};">
                  <div style="display: flex; align-items: center; margin-bottom: 10px;">
                    <div style="height: 40px; width: 40px; background: #e8f0fe; color: #074E5E; border-radius: 50%; text-align: center; line-height: 40px; font-weight: bold; margin-right: 12px;">
                      ${candidate.name?.charAt(0) || 'JS'}
                    </div>
                    <div>
                      <h3 style="margin: 0; font-size: 17px; color: #202124;">${candidate.name.trim() || 'Unbekannter Name'}</h3>
                      <p style="margin: 0; font-size: 13px; color: #074E5E; font-weight: bold;">${mainCategories}</p>
                    </div>
                  </div>

                  <div style="background: #fafafa; border-radius: 6px; padding: 12px; margin-top: 10px;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #444;">
                      <strong>Erfahrung Details:</strong>
                    </p>
                    ${candidate.jobSeeker.experiences
                      .map(
                        exp => `
                      <div style="font-size: 13px; color: #555; margin-bottom: 4px;">
                        • ${exp.subCategory} (${exp.experience} Jahre) 
                        <span style="color: #074E5E; font-weight: 500;"> - Erwartet: €${exp.salaryAmount.toLocaleString('de-DE')} / ${exp.salaryType}</span>
                      </div>
                    `,
                      )
                      .join('')}
                  </div>

                  <p style="margin: 12px 0 0 0; font-size: 13px; color: #777; line-height: 1.4;">
                    "${candidate.jobSeeker.overview?.substring(0, 120) || 'Keine Beschreibung verfügbar'}${candidate.jobSeeker.overview?.length > 120 ? '...' : ''}"
                  </p>
                </div>
              `;
              })
              .join('')}
          </div>

          <div style="background: #202124; color: white; padding: 25px; border-radius: 10px; text-align: center; margin-top: 25px;">
            <p style="margin: 0 0 10px 0; font-weight: bold; font-size: 16px;">Möchten Sie die Profile einsehen?</p>
            <p style="margin: 0; font-size: 14px; opacity: 0.9; line-height: 1.5;">
              Öffnen Sie die <strong>Jobsin App</strong>, um vollständige Lebensläufe und Kontaktdaten einzusehen und den Einstellungsprozess zu starten.
            </p>
          </div>

        </div>

        <div style="text-align: center; font-size: 12px; color: #999; margin-top: 25px;">
          <p style="margin: 0;">© ${new Date().getFullYear()} Jobsin App. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    `,
  };

  return data;
};

// job alert email template (to job seekers)
const jobAlert = (user: Partial<IUser>, jobs: IJob[]) => {
  const data = {
    to: user.email,
    subject: `🚀 ${jobs.length} neue Job-Angebote - Jobsin App`, // "New Job Alerts"
    html: `
      <div style="font-family: 'Trebuchet MS', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f7f6;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 25px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05); border: 1px solid #e1e4e8;">
          
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f0f0f0;">
            <h1 style="margin: 0; color: #074E5E; font-size: 24px;">Neue Job-Angebote</h1>
            <p style="margin: 5px 0 0 0; color: #666;">Hallo ${user.name || 'zusammen'}, wir haben passende Stellen für Ihr Profil gefunden.</p>
          </div>

          <div style="margin-top: 10px;">
            ${jobs
              .map(
                (job, index) => `
              <div style="padding: 20px 0; border-bottom: ${index === jobs.length - 1 ? 'none' : '1px solid #eee'};">
                <h3 style="color: #074E5E; margin: 0 0 5px 0; font-size: 18px;">${job.category} - ${job.subCategory}</h3>
                
                <p style="margin: 0; font-size: 14px; color: #444;">
                  <strong style="color: #202124;">Art:</strong> ${job.jobType} • 
                  <strong style="color: #202124;">Erfahrung:</strong> ${job.experience}
                </p>

                ${
                  job.salaryAmount
                    ? `
                  <p style="margin: 5px 0 0 0; color: #074E5E; font-size: 14px; font-weight: bold;">
                    Gehalt: €${job.salaryAmount.toLocaleString('de-DE')} (${job.salaryType})
                  </p>`
                    : ''
                }

                <p style="margin: 8px 0 0 0; font-size: 13px; color: #777; font-style: italic;">
                  Bewerbungsfrist: ${new Date(job.deadline).toLocaleDateString('de-DE')}
                </p>
              </div>
            `,
              )
              .join('')}
          </div>

          <div style="background: #074E5E; color: white; padding: 25px; border-radius: 10px; text-align: center; margin-top: 25px;">
            <p style="margin: 0 0 10px 0; font-weight: bold; font-size: 18px;">Bereit sich zu bewerben?</p>
            <p style="margin: 0; font-size: 15px; opacity: 0.95; line-height: 1.5;">
              Diese Jobs warten auf Sie! Öffnen Sie die <strong>Jobsin App</strong>, um die Aufgabenbereiche zu sehen und sich sofort zu bewerben.
            </p>
          </div>

        </div>

        <div style="text-align: center; font-size: 12px; color: #999; margin-top: 25px;">
          <p style="margin: 0;">© ${new Date().getFullYear()} Jobsin App. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    `,
  };
  return data;
};

export const emailTemplate = {
  createAccount,
  resetPassword,
  confirmAppointment,
  supportReply,
  paymentFailed,
  hiringRequestToAdmin,
  shiftPlanToWorker,
  jobAlert,
  jobSeekerAlert,
};
