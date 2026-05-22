<?php
// ===========================
// app/Mail/EmploiDuTempsMail.php
// ===========================
namespace App\Mail;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmploiDuTempsMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public $destinataire,
        public $emplois,
        public bool $isProf = false
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Emploi du Temps — ENI Fianarantsoa',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.emploi-du-temps',
            with: [
                'destinataire' => $this->destinataire,
                'emplois'      => $this->emplois,
                'isProf'       => $this->isProf,
            ]
        );
    }
}
