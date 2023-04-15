var initialisation = true;
var animationEnCours = true;

class LutinBonbon {
    constructor(type, positionX, positionY, positionCibleX, positionCibleY, tailleLutin) {
        this.type = type;
        this.positionX = positionX;
        this.positionY = positionY;
        this.positionCibleX = positionCibleX;
        this.positionCibleY = positionCibleY;
        this.tailleLutin = tailleLutin;
        this.type = type;
        this.image = new Image();
        this.setImage(type);
        this.vitesseChute = 5 // ajout de la vitesse de chute

    }

    setImage(type) {
        switch (type) {
            case 0:
                this.image.src = 'images/Blue.png';
                this.grayImage = new Image();
                this.grayImage.src = 'images/BlueGray.png';
                break;
            case 1:
                this.image.src = 'images/Green.png';
                this.grayImage = new Image();
                this.grayImage.src = 'images/GreenGray.png';
                break;
            case 2:
                this.image.src = 'images/Orange.png';
                this.grayImage = new Image();
                this.grayImage.src = 'images/OrangeGray.png';
                break;
            case 3:
                this.image.src = 'images/Red.png';
                this.grayImage = new Image();
                this.grayImage.src = 'images/RedGray.png';
                break;
            case 4:
                this.image.src = 'images/Yellow.png';
                this.grayImage = new Image();
                this.grayImage.src = 'images/YellowGray.png';
                break;
            default:
                break;
        }
    }

    griser() { // Grise le bonbon
        this.image = this.grayImage;
    }

    dessin(contexte) { // dessine le sprite avec sa position courante
        contexte.drawImage(this.image, this.positionX, this.positionY, this.tailleLutin, this.tailleLutin);
    }


    mettreAJour() { // met à jour la position Y en fonction de la vitesse de chute
        if (this.positionY != this.positionCibleY) {
            this.positionY += this.vitesseChute;
        }
        else {
            return true
        }
    }

}

class Vue {
    constructor(taille, controleur, modele, tailleLutin) {
        this.taille = taille;
        this.tailleLutin = tailleLutin;
        this.controleur = controleur;
        this.modele = modele;
        this.grille = [];
        this.score = 0
        this.colonnesExplosees = []
    }




    metAJourAPartirDuModele() {
        let nbBonbonsExploses = this.modele.faitExplosion();
        this.grille = this.modele.grille.map((ligne, i) => {
            return ligne.map((type, j) => {
                if (initialisation) {
                    document.querySelector('h1').innerHTML = 'Score: ' + this.score;
                    return new LutinBonbon(type, j * this.tailleLutin, i * this.tailleLutin - 500, j * this.tailleLutin, i * this.tailleLutin, this.tailleLutin);
                }
                else {
                    this.metAJourScore(nbBonbonsExploses);
                    return new LutinBonbon(type, j * this.tailleLutin, i * this.tailleLutin, j * this.tailleLutin, i * this.tailleLutin, this.tailleLutin);
                }
            });
        });
    }

    metAJourScore(nbBonbonsExploses) {
        this.score += nbBonbonsExploses;
        document.querySelector('h1').innerHTML = 'Score: ' + this.score;
    }


    dessinerBonbons(contexte) {
        this.grille.map(ligne => {
            ligne.map(bonbon => {
                bonbon.dessin(contexte);
            });
        });
    }

    griseBonbon(x, y) {
        let colonne = Math.floor(x / this.tailleLutin);
        let ligne = Math.floor(y / this.tailleLutin);
        let lutin = this.grille[ligne][colonne];
        lutin.griser();
    }



    afficheVue(contexte) {
        contexte.clearRect(0, 0, contexte.canvas.width, contexte.canvas.height);
        this.dessinerBonbons(contexte);
    }

    animeVue(contexte) {
        let ok = false;
        setInterval(() => {
            ok = true;
            this.grille.map(ligne => {
                ligne.map(bonbon => {
                    if (bonbon.positionY != bonbon.positionCibleY) {
                        bonbon.positionY += bonbon.vitesseChute;
                        ok = false;
                    }
                });
            });
            this.afficheVue(contexte)
            if (ok == true) {
                if (initialisation == false) { }
                let nbBonbonsExploses = this.modele.faitExplosion();
                this.metAJourScore(nbBonbonsExploses);
                this.metAJourAPartirDuModele()
                this.controleur.finAnimation();
            }
        }, 10);
    }

}


class Modele { //


    constructor(taille) { // taille est le coté du carré en nombre de cases
        this.grille = Array(taille).fill().map(() =>
            Array(taille).fill().map(() => Math.floor(Math.random() * 5))
        );
    }



    echangeProvoqueExplosion(x1, y1, x2, y2) {
        // Échanger temporairement les deux cases
        let temp = this.grille[y1][x1];
        this.grille[y1][x1] = this.grille[y2][x2];
        this.grille[y2][x2] = temp;

        // Vérifier s'il y a des alignements après l'échange
        let alignements = this.explosePossible();
        let explosion = alignements.length > 0;

        // Annuler l'échange
        this.grille[y2][x2] = this.grille[y1][x1];
        this.grille[y1][x1] = temp;

        return explosion;
    }

    estVoisin(x1, y1, x2, y2) {
        if (y1 == y2 + 1 || y1 == y2 - 1 || x1 == x2 + 1 || x1 == x2 - 1) {
            return true
        }
        return false;
    }

    echange2cases(x1, y1, x2, y2) {
        if (this.estVoisin(x1, y1, x2, y2)) {
            if (this.echangeProvoqueExplosion(x1, y1, x2, y2)) {
                let temp = this.grille[y1][x1];
                this.grille[y1][x1] = this.grille[y2][x2];
                this.grille[y2][x2] = temp;
            }
        }
    }


    faitExplosion() {
        const alignements = this.explosePossible();
        let nbBonbonsExploses = alignements.length;

        if (alignements.length > 0) {
            alignements.map(([x, y]) => {
                // Faire tomber les bonbons d'au-dessus
                for (let i = x; i > 0; i--) {
                    this.grille[i][y] = this.grille[i - 1][y];
                }
                this.grille[0][y] = Math.floor(Math.random() * 5); // Ajouter un nouveau bonbon en haut
            });
            this.faitExplosion(); // Répéter tant qu'il y a des alignements

        }
        return nbBonbonsExploses
    }




    explosePossible() {
        let alignements = [];

        // Vérifier les alignements horizontaux
        this.grille.forEach((ligne, i) => {
            ligne.map((colonne, j) => {
                if (colonne !== 9 && colonne === ligne[j + 1] && colonne === ligne[j + 2]) {
                    alignements.push([i, j], [i, j + 1], [i, j + 2]);
                }
            });
        });

        // Vérifier les alignements verticaux
        this.grille.forEach((ligne, i) => {
            ligne.map((colonne, j) => {
                if (colonne !== 9 && i < this.grille.length - 2 && colonne === this.grille[i + 1][j] && colonne === this.grille[i + 2][j]) {
                    alignements.push([i, j], [i + 1, j], [i + 2, j]);
                }
            });
        });

        return alignements;
    }

}



class Controleur { 


    constructor(tailleJeu) {
        this.modele = new Modele(tailleJeu);
        this.maVue = new Vue(tailleJeu, this, this.modele, 50);
        this.firstClick = true;
        this.firstX = null;
        this.firstY = null;
    }

    finAnimation() {
        animationEnCours = false;
        document.addEventListener("click", this.captureClick);

    }



    click(x, y) {
        if (this.firstClick) {
            this.firstClick = false;
            this.firstX = x;
            this.firstY = y;
            this.maVue.griseBonbon(x, y);
        } else {
            this.firstClick = true;
            let x1 = Math.floor(this.firstX / 50);
            let y1 = Math.floor(this.firstY / 50);
            let x2 = Math.floor(x / 50);
            let y2 = Math.floor(y / 50);


            this.modele.echange2cases(x1, y1, x2, y2);

        }
    }

}

function captureClick(event) // on intercepte le click souris
{ // calcul des coordonnées de la souris dans le canvas
    if (animationEnCours) return;

    if (event.target.id == "cvs") {
        var x = event.pageX - event.target.offsetLeft;
        var y = event.pageY - event.target.offsetTop;
        this.click(x, y)
    }
}



function init() {
    // variable globale
    context = document.getElementById("cvs").getContext("2d");
    context.width = document.getElementById("cvs").width;
    context.height = document.getElementById("cvs").height;
    var jeu = new Controleur(10); // cree une grille de 10x10

    document.addEventListener("click", captureClick.bind(jeu))
    jeu.maVue.metAJourAPartirDuModele();
    initialisation = false;
    jeu.maVue.animeVue(context);
}


