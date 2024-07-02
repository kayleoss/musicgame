$(document).ready(function(){
    $('.gameshow, .leaderboard').hide();
    $('body').css("background-image", "url('assets/main.PNG')")

    if (window.innerWidth < 1260) {
        $('.songs-selection').empty();
        $('.songs-selection').append("<p>Your screen size is too small.</p>")
    }

    $('button.song-button').on('click', function() {
        vcx =  $(this).attr('id')
        $('.start').hide();
        $('.getready').show();
        setTimeout(function() {
            startGame(vcx);
        }, 5000)
    })

    fetch('https://musicgamebackend.vercel.app/leaderboard')
    .then(res => res.json())
    .then(data => {
        for (const [key, value] of Object.entries(data.scoreData)) {
            let songName;
            switch(key) {
                case "scandalbaby":
                    songName = "Scandal - Scandal Baby"
                    break;
                case "shunkansentimental":
                    songName = "Scandal - Shunkan Sentimental"
                    break;
                case "shinigamieyes":
                    songName = "Grimes - Shinigami Eyes"
                    break;
                case "realiti":
                    songName = 'Grimes - REALiTi'
                    break;
                case "aroundtheworld":
                        songName = 'Daft Punk - Around The World'
                        break;
                default:
                    songName = "None"
            }
            $('#leaderboard').append(`<p class='score'>${songName} <span>${value}</span></p>`)
        }
    }) 

    function startGame(song) {
        $('.gamehide').hide();
        $('.gameshow').show();
        $('.getready').hide();

        let bgImg = "url('assets/" + song + ".jpg')"
        let audioSource;
        let analyser;
        let score = 0;

        $('body').css({"background-image": bgImg, "background-repeat": 'no-repeat', "background-size": 'cover'})

        fetch('https://musicgamebackend.vercel.app/songs/' + song)
            .then(res => res.json())
            .then(data => {
                songAudio = new Audio("data:audio/wav;base64," + data);
                songContext = new AudioContext();

                songAudio.play();
                $('#score').text(score)
                
                audioSource = songContext.createMediaElementSource(songAudio);
                analyser = songContext.createAnalyser();
                audioSource.connect(analyser);
                analyser.connect(songContext.destination);
                analyser.fftSize = 64;

                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);

                window.addEventListener('keypress', function(e) {
                    if (e.key === $('.showkeys > p:last').data('key') && !$('.showkeys > p:last').hasClass('evaluated')) {
                        const position = parseFloat($('#keyBar').css('left'))
                        if (position <= 250) {
                            flashResult('green', 50)
                        } else {
                            flashResult('red', -50)
                        }
                    } else {
                        if (!$('.showkeys > p:last').hasClass('evaluated')) {
                            flashResult('red', -500)
                        }
                    }
                })

                $('.showkeys').append('<p id="keyBar" class="neutral" data-key="f">F</p>')

                function playNotes() {
                    analyser.getByteFrequencyData(dataArray)
                    
                    let key = 0;
                    for (i=0; i<bufferLength; i++) {
                        key = dataArray[i];
                        let position = parseFloat($('#keyBar').css('left'));

                        if (key > 50 && position > 0) {
                            $('#keyBar').css('left', '-=1px');
                        }

                        if (position <= 0) {
                            $('.showkeys').empty();
                            const newNote = randomizeLetter(key)
                            $('.showkeys').append(`<p id="keyBar" class="neutral" data-key="${newNote.toLowerCase()}">${newNote}</p>`)

                            $('#keyBar').css('left', '1200px');
                            $('.showkeys > p:last').removeClass('evaluated')
                            $('.successBox').css({'background': 'rgba(23, 0, 87, 0.301)','border': '2px solid rgb(224, 0, 224)'})
                        }
                    }
                    requestAnimationFrame(playNotes);
                }
                
                songAudio.addEventListener('ended', () => {
                    $('.gameshow').hide()
                    cancelAnimationFrame(playNotes)
                    endGame(score, song);
                });
                
                playNotes();
            })

            function writeScore(num) {
                score += num;
                $('#score').text(score)
            }

            function flashResult(color, score) {
                writeScore(score)
                $('.showkeys > p:last').addClass('evaluated')
                if (color === 'red') {
                    $('.showkeys > p:last').css('background', "rgba(231, 36, 0, 0.65)")
                    $('.successBox').css({"background": "rgba(231, 36, 0, 0.65)","border": "2px solid rgba(231, 36, 0, 0.65)"})
                } else {
                    $('.showkeys > p:last').css('background', "rgba(2, 143, 2, 0.65)")
                    $('.successBox').css({"background": "rgba(2, 143, 2, 0.65)", "border": "2px solid rgba(2, 143, 2, 0.65)"})
                }
            }
    }

    function randomizeLetter() {
        const letters = 'WASDF'
        const result = letters.charAt(Math.random() * letters.length)
        return result
    }

    function endGame(score, song) {
        $('.scoreh2').css('font-size', '50px;')
        $('.giveupbutton').text('Return')
        
        fetch('https://musicgamebackend.vercel.app/leaderboard',
            {
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify({score: score, song: song})
            }
        )
        .then(res => res.json())
        .then(data => {
            $('.leaderboard').show()
            let songName;
            console.log(song)
            
            switch (song){
                case "scandalbaby":
                    songName = 'Scandal - Scandal Baby'
                    break;
                case "shunkansentimental":
                    songName = 'Scandal - Shunkan Sentimental'
                    break;
                case "shinigamieyes":
                    songName = 'Grimes - Shinigami Eyes'
                    break;
                case "realiti":
                    songName = 'Grimes - REALiTi'
                    break;
                case "aroundtheworld":
                    songName = 'Daft Punk - Around The World'
                    break;
                default: 
                    songName = 'None'
            }

            if (data.newScore == true) {
                $('.leaderboard').append(`<p class='text-center' style='color:pink'>Song: ${songName}</p><p class='leaderboard-text text-center'><span>New high score!!!</span><br> Your score: ${score}<br><br><a href='' style="color:white;">End Game</a></p>`)
            } else {
                $('.leaderboard').append(`<p class='text-center' style='color:pink'>Song: ${songName}</p><p class='leaderboard-text text-center'>Highest score: ${data.score}<br>Your score: ${score}<br><br><a href='' style="color:white;">End Game</a></p>`)
            }
        })
    }
})