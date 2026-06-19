<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmploiDuTempsMail extends Mailable
{
    use Queueable, SerializesModels;

    public $destinataire;
    public $emplois;
    public bool $isProf;
    public ?string $customSubject;
    public ?string $customHtml;

    public function __construct(
        $destinataire,
        $emplois,
        bool $isProf = false,
        ?string $customSubject = null,
        ?string $customHtml = null
    ) {
        $this->destinataire = $destinataire;
        $this->emplois = $emplois;
        $this->isProf = $isProf;
        $this->customSubject = $customSubject;
        $this->customHtml = $customHtml;
    }

    public function envelope(): Envelope
    {
        $subject = $this->customSubject ?? (
            $this->isProf 
                ? 'Votre emploi du temps — ENI Fianarantsoa'
                : 'Votre emploi du temps — ENI Fianarantsoa'
        );

        return new Envelope(
            subject: $subject,
        );
    }

    public function content(): Content
    {
        if ($this->customHtml) {
            return new Content(
                html: $this->customHtml,
            );
        }

        return new Content(
            view: 'emails.emploi-du-temps',
            with: [
                'destinataire' => $this->destinataire,
                'emplois' => $this->emplois,
                'isProf' => $this->isProf,
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}