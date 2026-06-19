<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Emploi du temps</title>
    <style>
        body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
        .header { background: linear-gradient(135deg, #1a237e 0%, #0d47a1 100%); padding: 30px; color: white; text-align: center; border-radius: 12px; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 8px 0 0; opacity: 0.9; }
        .header .subtitle { font-size: 14px; opacity: 0.8; margin-top: 8px; }
        .content { padding: 25px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; border-radius: 8px; overflow: hidden; }
        th { background: #1a237e; color: white; padding: 12px 15px; text-align: left; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
        td { padding: 12px 15px; border-bottom: 1px solid #e0e0e0; }
        tr:last-child td { border-bottom: none; }
        .badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: bold; margin: 2px; }
        .badge-niveau { background: #e3f2fd; color: #1565c0; }
        .badge-parcours { background: #f3e5f5; color: #7b1fa2; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0; text-align: center; font-size: 12px; color: #888; }
        .footer .logo { color: #1a237e; font-weight: bold; }
        .empty-state { text-align: center; color: #999; padding: 30px; font-style: italic; }
        .course-title { font-weight: 600; color: #1a237e; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏛️ ENI Fianarantsoa</h1>
        <p>Emploi du temps de la semaine</p>
        @if(isset($destinataire) && $destinataire)
            <div class="subtitle">
                {{ $isProf ? '👨‍🏫 ' : '' }}{{ $destinataire->nom ?? $destinataire->name ?? 'Étudiant' }}
            </div>
        @endif
    </div>
    
    <div class="content">
        <p>Bonjour <strong>{{ $destinataire->nom ?? $destinataire->name ?? 'Étudiant' }}</strong>,</p>
        <p>Veuillez trouver ci-dessous votre emploi du temps.</p>
        
        @if($emplois->isEmpty())
            <div class="empty-state">Aucun cours programmé pour cette semaine.</div>
        @else
            <table>
                <thead>
                    <tr>
                        <th>Jour</th>
                        <th>Matière</th>
                        <th>Horaire</th>
                        <th>Professeur</th>
                        <th>Salle</th>
                    </tr>
                </thead>
                <tbody>
                    @php
                        $jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
                    @endphp
                    @foreach($jours as $jour)
                        @php
                            $dayCourses = $emplois->filter(function($course) use ($jour) {
                                return $course->jour === $jour;
                            });
                        @endphp
                        @if($dayCourses->isNotEmpty())
                            @foreach($dayCourses as $course)
                                <tr>
                                    <td><strong>{{ $jour }}</strong></td>
                                    <td>
                                        <div class="course-title">{{ $course->matiere }}</div>
                                        <div style="margin-top: 4px;">
                                            <span class="badge badge-niveau">{{ $course->niveau }}</span>
                                            <span class="badge badge-parcours">{{ $course->parcours }}</span>
                                        </div>
                                    </td>
                                    <td>{{ $course->heure_debut }} - {{ $course->heure_fin }}</td>
                                    <td>{{ $course->prof?->name ?? '—' }}</td>
                                    <td>{{ $course->salle?->nom ?? '—' }}</td>
                                </tr>
                            @endforeach
                        @endif
                    @endforeach
                </tbody>
            </table>
        @endif
    </div>
    
    <div class="footer">
        <p>
            <span class="logo">🏛️ ENI Fianarantsoa</span> - École Nationale d'Informatique
        </p>
        <p style="font-size: 11px; margin-top: 4px;">
            Ce message a été généré automatiquement. Merci de ne pas y répondre.
        </p>
        <p style="font-size: 10px; color: #bbb; margin-top: 8px;">
            Document généré le {{ now()->format('d/m/Y à H:i') }}
        </p>
    </div>
</body>
</html>