const letters = split(animatable)
setTimeout(() => letters.forEach(span => span.style.opacity = 1), 0)

function split(element) {
  element.style.wordBreak = 'break-word'

  const letters = element.innerText.split('').map((letter, i) => {
    const span = document.createElement('span')
    span.innerHTML = letter !== ' ' ? letter : '&nbsp;'
    span.style.opacity = 0
    span.style.transitionDelay = 0.01 * i + 's'
    return span
  })

  element.innerHTML = ''
  element.append(...letters)
  return letters
}

document.addEventListener('DOMContentLoaded', function() {
    const movingBlock = document.getElementById('moving-block');
  
    document.addEventListener('mousemove', function(e) {
      const xAxis = (window.innerWidth / 2 - e.pageX) / 40;
      const yAxis = (window.innerHeight / 2 - e.pageY) / 40;
  
      movingBlock.style.transform = `translate(${xAxis}px, ${yAxis}px)`;
    });
  
    // Добавляем обработчик события mouseover, чтобы запустить анимацию
    movingBlock.addEventListener('mouseover', function() {
      movingBlock.classList.add('animate');
    });
});  
  