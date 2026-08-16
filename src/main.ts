type TimerMode = "focus" | "short" | "long";

interface TimerConfig {
    duration: number;
    label: string;
}

const CONFIG: Record<TimerMode, TimerConfig> = {
    focus: {
        duration: 25 * 60,
        label: "TEMPO DE FOCO"
    },

    short: {
        duration: 5 * 60,
        label: "PAUSA CURTA"
    },

    long: {
        duration: 15 * 60,
        label: "PAUSA LONGA"
    }
};


class Pomodoro {

    private mode: TimerMode = "focus";

    private remaining: number = CONFIG.focus.duration;

    private timer: number | null = null;

    private running: boolean = false;

    private session: number = 1;

    private cycles: number = 0;

    private focusSessions: number = 0;

    private totalMinutes: number = 0;


    private readonly timerElement =
        document.querySelector("#timer") as HTMLElement;

    private readonly timerLabel =
        document.querySelector("#timerLabel") as HTMLElement;

    private readonly sessionInfo =
        document.querySelector("#sessionInfo") as HTMLElement;

    private readonly startBtn =
        document.querySelector("#startBtn") as HTMLButtonElement;

    private readonly startIcon =
        document.querySelector("#startIcon") as HTMLElement;

    private readonly startText =
        document.querySelector("#startText") as HTMLElement;

    private readonly resetBtn =
        document.querySelector("#resetBtn") as HTMLButtonElement;

    private readonly skipBtn =
        document.querySelector("#skipBtn") as HTMLButtonElement;

    private readonly progress =
        document.querySelector("#progress") as SVGCircleElement;

    private readonly status =
        document.querySelector(".status") as HTMLElement;

    private readonly statusText =
        document.querySelector("#statusText") as HTMLElement;

    private readonly cycleCount =
        document.querySelector("#cycleCount") as HTMLElement;

    private readonly focusCount =
        document.querySelector("#focusCount") as HTMLElement;

    private readonly totalMinutesElement =
        document.querySelector("#totalMinutes") as HTMLElement;

    private readonly notification =
        document.querySelector("#notification") as HTMLElement;

    private readonly notificationTitle =
        document.querySelector("#notificationTitle") as HTMLElement;

    private readonly notificationText =
        document.querySelector("#notificationText") as HTMLElement;


    constructor() {

        this.bindEvents();

        this.updateUI();

    }


    private bindEvents(): void {

        this.startBtn.addEventListener(
            "click",
            () => this.toggleTimer()
        );

        this.resetBtn.addEventListener(
            "click",
            () => this.reset()
        );

        this.skipBtn.addEventListener(
            "click",
            () => this.skip()
        );


        document
            .querySelectorAll<HTMLButtonElement>(".mode")
            .forEach(button => {

                button.addEventListener("click", () => {

                    const mode =
                        button.dataset.mode as TimerMode;

                    this.changeMode(mode);

                });

            });


        document.addEventListener(
            "keydown",
            event => {

                if (event.code === "Space") {

                    event.preventDefault();

                    this.toggleTimer();

                }

                if (event.key.toLowerCase() === "r") {

                    this.reset();

                }

            }
        );

    }


    private toggleTimer(): void {

        if (this.running) {

            this.pause();

        } else {

            this.start();

        }

    }


    private start(): void {

        if (this.running) return;

        this.running = true;

        this.status.classList.add("running");

        this.statusText.textContent = "Sessão em andamento";

        this.startIcon.textContent = "Ⅱ";

        this.startText.textContent = "Pausar";


        this.timer = window.setInterval(() => {

            this.remaining--;

            this.updateUI();


            if (this.remaining <= 0) {

                this.complete();

            }

        }, 1000);

    }


    private pause(): void {

        this.running = false;

        this.clearTimer();

        this.status.classList.remove("running");

        this.statusText.textContent = "Sessão pausada";

        this.startIcon.textContent = "▶";

        this.startText.textContent = "Continuar";

    }


    private reset(): void {

        this.clearTimer();

        this.running = false;

        this.remaining = CONFIG[this.mode].duration;

        this.status.classList.remove("running");

        this.statusText.textContent = "Pronto para começar";

        this.startIcon.textContent = "▶";

        this.startText.textContent = "Iniciar";

        this.updateUI();

    }


    private skip(): void {

        this.clearTimer();

        this.running = false;

        this.nextSession();

    }


    private complete(): void {

        this.clearTimer();

        this.running = false;


        if (this.mode === "focus") {

            this.focusSessions++;

            this.totalMinutes += 25;

            this.cycles++;

            this.showNotification(
                "Foco concluído!",
                "Hora de descansar um pouco."
            );

            this.mode =
                this.cycles % 4 === 0
                    ? "long"
                    : "short";

        } else {

            this.showNotification(
                "Pausa concluída!",
                "Pronto para voltar ao foco."
            );

            this.mode = "focus";

        }


        this.session++;

        this.remaining =
            CONFIG[this.mode].duration;

        this.status.classList.remove("running");

        this.statusText.textContent =
            "Pronto para começar";

        this.startIcon.textContent = "▶";

        this.startText.textContent = "Iniciar";


        this.updateModeButtons();

        this.updateUI();

        this.playSound();

    }


    private nextSession(): void {

        if (this.mode === "focus") {

            this.mode =
                this.cycles > 0 && this.cycles % 4 === 0
                    ? "long"
                    : "short";

        } else {

            this.mode = "focus";

        }

        this.session++;

        this.remaining =
            CONFIG[this.mode].duration;

        this.statusText.textContent =
            "Pronto para começar";

        this.startIcon.textContent = "▶";

        this.startText.textContent = "Iniciar";

        this.updateModeButtons();

        this.updateUI();

    }


    private changeMode(mode: TimerMode): void {

        this.clearTimer();

        this.running = false;

        this.mode = mode;

        this.remaining =
            CONFIG[mode].duration;

        this.status.classList.remove("running");

        this.statusText.textContent =
            "Pronto para começar";

        this.startIcon.textContent = "▶";

        this.startText.textContent = "Iniciar";

        this.updateModeButtons();

        this.updateUI();

    }


    private clearTimer(): void {

        if (this.timer !== null) {

            window.clearInterval(this.timer);

            this.timer = null;

        }

    }


    private updateUI(): void {

        const config = CONFIG[this.mode];

        const minutes =
            Math.floor(this.remaining / 60);

        const seconds =
            this.remaining % 60;


        this.timerElement.textContent =
            `${minutes.toString().padStart(2, "0")}:${seconds
                .toString()
                .padStart(2, "0")}`;


        this.timerLabel.textContent =
            config.label;


        this.sessionInfo.textContent =
            `Sessão ${this.session}`;


        this.updateProgress();

        this.updateStats();


        document.title =
            `${this.timerElement.textContent} • Pomodoro`;

    }


    private updateProgress(): void {

        const radius = 124;

        const circumference =
            2 * Math.PI * radius;

        const duration =
            CONFIG[this.mode].duration;

        const progress =
            this.remaining / duration;


        const offset =
            circumference * (1 - progress);


        this.progress.style.strokeDasharray =
            `${circumference}`;

        this.progress.style.strokeDashoffset =
            `${offset}`;

    }


    private updateStats(): void {

        this.cycleCount.textContent =
            this.cycles.toString();

        this.focusCount.textContent =
            this.focusSessions.toString();

        this.totalMinutesElement.textContent =
            this.totalMinutes.toString();

    }


    private updateModeButtons(): void {

        document
            .querySelectorAll<HTMLButtonElement>(".mode")
            .forEach(button => {

                button.classList.toggle(
                    "active",
                    button.dataset.mode === this.mode
                );

            });

    }


    private showNotification(
        title: string,
        text: string
    ): void {

        this.notificationTitle.textContent = title;

        this.notificationText.textContent = text;

        this.notification.classList.add("show");


        window.setTimeout(() => {

            this.notification.classList.remove("show");

        }, 4500);

    }


    private playSound(): void {

        const AudioContextClass =
            window.AudioContext ||
            (window as any).webkitAudioContext;

        if (!AudioContextClass) return;

        const context =
            new AudioContextClass();

        const oscillator =
            context.createOscillator();

        const gain =
            context.createGain();


        oscillator.type = "sine";

        oscillator.frequency.value = 700;

        gain.gain.value = 0.08;


        oscillator.connect(gain);

        gain.connect(context.destination);


        oscillator.start();


        gain.gain.exponentialRampToValueAtTime(
            0.001,
            context.currentTime + 0.5
        );


        oscillator.stop(
            context.currentTime + 0.5
        );

    }

}


new Pomodoro();
