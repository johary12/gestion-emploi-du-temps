<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Emploi du Temps — ENI Fianarantsoa</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #f4f6f9; margin: 0; padding: 20px; }
        .container { max-width: 700px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #1a3a6e, #2563eb); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0 0 6px; font-size: 22px; }
        .header p  { margin: 0; opacity: 0.85; font-size: 14px; }
        .body      { padding: 30px; }
        .greeting  { font-size: 16px; margin-bottom: 20px; color: #1e293b; }
        table      { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th         { background: #1a3a6e; color: white; padding: 12px 10px; font-size: 13px; text-align: left; }
        td         { padding: 10px; font-size: 13px; color: #374151; border-bottom: 1px solid #e5e7eb; }
        tr:nth-child(even) td { background: #f8fafc; }
        .jour-badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; background: #dbeafe; color: #1d4ed8; }
        .footer    { background: #f8fafc; padding: 20px 30px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
        .footer strong { color: #1a3a6e; }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>🎓 ENI Fianarantsoa</h1>
        <p>École Nationale d'Informatique — Emploi du Temps</p>
    </div>

    <div class="body">
        <p class="greeting">
            Bonjour <strong>{{ $destinataire->name ?? $destinataire->nom }}</strong>,
            <br><br>
            @if($isProf)
                Veuillez trouver ci-dessous votre emploi du temps de la semaine.
            @else
                Veuillez trouver ci-dessous l'emploi du temps pour votre promotion
                <strong>{{ $destinataire->niveau }} — {{ $destinataire->parcours }}</strong>.
            @endif
        </p>

        @if($emplois->isEmpty())
            <p style="color:#6b7280;font-style:italic;">Aucun cours programmé pour le moment.</p>
        @else
        <table>
            <thead>
                <tr>
                    <th>Jour</th>
                    <th>Horaire</th>
                    <th>Matière</th>
                    @if($isProf)
                        <th>Niveau / Parcours</th>
                    @else
                        <th>Professeur</th>
                    @endif
                    <th>Salle</th>
                </tr>
            </thead>
            <tbody>
                @foreach($emplois as $e)
                <tr>
                    <td><span class="jour-badge">{{ $e->jour ?? $e['jour'] }}</span></td>
                    <td>{{ $e->heure_debut ?? $e['heure_debut'] }} – {{ $e->heure_fin ?? $e['heure_fin'] }}</td>
                    <td><strong>{{ $e->matiere ?? $e['matiere'] }}</strong></td>
                    @if($isProf)
                        <td>{{ $e->niveau ?? $e['niveau'] }} / {{ $e->parcours ?? $e['parcours'] }}</td>
                    @else
                        <td>{{ $e->prof?->name ?? ($e['prof'] ?? '—') }}</td>
                    @endif
                    <td>{{ $e->salle?->nom ?? ($e['salle'] ?? '—') }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif
    </div>

    <div class="footer">
        <strong>ENI Fianarantsoa</strong> — Système de gestion des emplois du temps<br>
        Ce message a été envoyé automatiquement, merci de ne pas y répondre.
    </div>
</div>
</body>
</html>
