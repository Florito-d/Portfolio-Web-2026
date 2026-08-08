// Attend que toute la page HTML soit complètement chargée
// avant d’exécuter le script (évite les erreurs si le DOM n’est pas prêt)
document.addEventListener("DOMContentLoaded", function () {

  // Récupère l’élément <header> du site
  // Il contient le logo, le bouton hamburger et le menu de navigation
  const header = document.querySelector(".site-header");

  // Récupère le bouton "hamburger"
  // C’est l’icône cliquable qui ouvre/ferme le menu sur mobile
  const toggle = document.querySelector(".menu-access");

  // Récupère la navigation principale (<nav>)
  // Contient la liste des liens du menu
  const nav = document.querySelector(".main-navigation");

  // Sécurité :
  // Si l’un des éléments n’existe pas dans la page,
  // le script s’arrête pour éviter une erreur JavaScript
  if (!header || !toggle || !nav) return;

  // Fonction utilitaire pour ouvrir ou fermer le menu
  // isOpen = true → menu ouvert
  // isOpen = false → menu fermé
  function setOpen(isOpen){

    // Ajoute ou enlève la classe CSS "is-menu-open" sur le header
    // Cette classe déclenche l’affichage du menu en CSS
    header.classList.toggle("is-menu-open", isOpen);

    // Met à jour l’attribut d’accessibilité aria-expanded
    // Permet aux lecteurs d’écran de savoir si le menu est ouvert ou fermé
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }

  // Fonction qui inverse l’état du menu
  // Si le menu est ouvert → on le ferme
  // S’il est fermé → on l’ouvre
  function toggleMenu(){
    const isOpen = header.classList.contains("is-menu-open");
    setOpen(!isOpen);
  }

  // ============================
  // INTERACTIONS UTILISATEUR
  // ============================

  // Clic sur le bouton hamburger
  // → ouvre ou ferme le menu
  toggle.addEventListener("click", toggleMenu);

  // Gestion du clavier pour l’accessibilité
  toggle.addEventListener("keydown", function(e){

    // Si l’utilisateur appuie sur Entrée ou Espace
    // → comportement identique à un clic
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault(); // empêche le scroll ou un comportement par défaut
      toggleMenu();
    }

    // Si l’utilisateur appuie sur Échap
    // → ferme le menu
    if (e.key === "Escape") setOpen(false);
  });

  // Ferme le menu lorsqu’on clique sur un lien du menu
  // (utile surtout sur mobile)
  nav.addEventListener("click", function(e){
    if (e.target.tagName.toLowerCase() === "a") {
      setOpen(false);
    }
  });

  // Ferme le menu si la touche Échap est pressée
  // même si le focus n’est pas sur le bouton hamburger
  document.addEventListener("keydown", function(e){
    if (e.key === "Escape") setOpen(false);
  });
});
